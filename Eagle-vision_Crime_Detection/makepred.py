import h5py
import torch
from torch.utils.data import Dataset, DataLoader
import numpy as np
import cv2
from opencv_videovision import transforms
from utils.make_h5 import Video2ImgH5_single
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from matplotlib.patches import Circle
import cv2
import numpy as np
import os
from tqdm import tqdm
import models
from scipy.ndimage import gaussian_filter1d
from utils.eval_utils import cal_bcla
import matplotlib.pyplot as plt
import sys
import io
from contextlib import redirect_stdout

class I3D_Inference(Dataset):
    def __init__(self, h5_file, segment_len, height=256, width=340, crop_size=224):
        self.h5_path = h5_file
        with h5py.File(self.h5_path, 'r') as h5:
            self.keys = sorted(list(h5.keys()))
            self.dataset_len = len(h5[self.keys[0]][:])
        
        self.segment_len = segment_len
        self.height = height
        self.width = width
        self.crop_size = crop_size
        
        self.mean = [128, 128, 128]
        self.std = [128, 128, 128]
        
        self.transforms = transforms.Compose([
            transforms.Resize([self.height, self.width]),
            transforms.ClipToTensor(div_255=False),
            transforms.Normalize(mean=self.mean, std=self.std)
        ])

    def __len__(self):
        return len(self.keys)

    def decode_imgs(self, frames):
        new_frames = []
        for frame in frames:
            new_frames.append(cv2.cvtColor(cv2.imdecode(np.frombuffer(frame, np.uint8), cv2.IMREAD_COLOR), cv2.COLOR_BGR2RGB))
        new_frames = self.transforms(new_frames)
        return new_frames

    def __getitem__(self, i):
        key = self.keys[i]
        with h5py.File(self.h5_path, 'r') as h5:
            frames = h5[key][:]
        frames = self.decode_imgs(frames)
        return frames

# Configuration
MODEL_TYPE = 'UCF_I3D'  
EXPAND_K = 8
GPUS = '0'
BATCH_SIZE = 10
DROPOUT_RATE = 0.8
SEGMENT_LEN = 16
LEARNING_RATE = 1e-4
WEIGHT_DECAY = 5e-4
TEST_TEN_CROP = False
VIS_UCF = False
MODEL_CHECKPOINT_PATH = r"ckpts\UCF_I3D_AUC_0.85989.pth"
h5_path = r"./temp_h5/temp.h5"

os.environ['CUDA_VISIBLE_DEVICES'] = GPUS
GPU_LIST = [i for i in range(len(GPUS.split(',')))]

def load_model(model, state_dict):
    new_dict = {}
    for key, value in state_dict.items():
        new_dict[key[7:]] = value
    model.load_state_dict(new_dict)

def load_model_dataset(video_path, oversampledCrop):
    Video2ImgH5_single(video_path, h5_path)
    model = getattr(models, 'I3D_SGA_STD')(
        dropout_rate=DROPOUT_RATE,
        expand_k=EXPAND_K,
        freeze_backbone=False,
        freeze_blocks=None
    ).cuda().eval()
    
    optimizer = torch.optim.Adam(
        model.parameters(), lr=LEARNING_RATE, weight_decay=WEIGHT_DECAY, betas=(0.9, 0.999)
    )
    
    bcla = cal_bcla(oversampledCrop)

    # Using PyTorch's native AMP
    scaler = torch.cuda.amp.GradScaler()

    dataset = I3D_Inference(h5_path, SEGMENT_LEN)
    load_model(model, torch.load(MODEL_CHECKPOINT_PATH)['model'])
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    return model, dataloader, bcla

def infer(model, dataloader):
    model.eval()
    all_scores = []
    total_scores = []
    
    with torch.no_grad():
        with torch.cuda.amp.autocast():  # Enable automatic mixed precision
            for frames in tqdm(dataloader): # add tqdm if necessary
                frames = frames.float().contiguous().view([-1, 3, frames.shape[-3], frames.shape[-2], frames.shape[-1]]).cuda()
                scores, _ = model(frames)[:2]
                for score in scores:
                    score = score.float().squeeze()[1].detach().cpu().item()
                    score = [score] * SEGMENT_LEN
                    total_scores.extend(score)
    return total_scores

def play_video_with_plot(video_path, scores, smoothened_scores):
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    plt.style.use('dark_background')
    fig = plt.figure(figsize=(12, 8))
    gs = fig.add_gridspec(2, 1, height_ratios=[2, 1], hspace=0.3)
    
    ax_video = fig.add_subplot(gs[0])
    ax_video.axis('off')
    video_img = ax_video.imshow(np.zeros((256, 340, 3), dtype=np.uint8))
    
    ax_plot = fig.add_subplot(gs[1])
    ax_plot.set_facecolor('#1f1f1f')
    fig.patch.set_facecolor('#121212')
    
    ax_plot.grid(True, linestyle='--', alpha=0.3)
    ax_plot.set_xlim(0, len(scores))
    ax_plot.set_ylim(min(min(scores), min(smoothened_scores)) - 0.1, 
                     max(max(scores), max(smoothened_scores)) + 0.1)
    ax_plot.set_title("Anomaly Detection Scores", color='white', pad=20, fontsize=12)
    ax_plot.set_xlabel("Frame Index", color='white', fontsize=10)
    ax_plot.set_ylabel("Anomaly Score", color='white', fontsize=10)
    
    ax_plot.tick_params(colors='white')
    for spine in ax_plot.spines.values():
        spine.set_color('white')
    
    original_line, = ax_plot.plot(range(len(scores)), scores, 
                                label='Original', linestyle='--', 
                                color='#4a9eff', alpha=0.6, linewidth=1.5)
    smoothened_line, = ax_plot.plot(range(len(smoothened_scores)), smoothened_scores, 
                                 label='Smoothened', color='#50fa7b', 
                                 linewidth=2)
    
    threshold = np.mean(smoothened_scores) + 2 * np.std(smoothened_scores)
    
    
    current_frame_line = ax_plot.axvline(x=0, color='#ff79c6', 
                                       linestyle='-', alpha=0.8)
    
    legend = ax_plot.legend(loc='upper right', facecolor='#282a36', 
                           edgecolor='#44475a', framealpha=0.7)
    for text in legend.get_texts():
        text.set_color('white')
    
    score_text = ax_plot.text(0.01, 0.85, '', transform=ax_plot.transAxes,
                             color='white', fontsize=10, 
                             backgroundcolor='#282a36')
    score_text.set_bbox(dict(facecolor='#282a36', alpha=0.7, edgecolor='none'))

    paused = False
    current_frame = 0
    skip_frames = int(fps)  
    
    def seek_frame(target_frame):
        target_frame = max(0, min(target_frame, total_frames - 1))
        cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
        return target_frame
    
    def on_key_press(event):
        nonlocal paused, current_frame
        if event.key == ' ':  
            paused = not paused
        elif event.key == 'r':  
            current_frame = seek_frame(0)
        elif event.key == 'right':  
            current_frame = seek_frame(current_frame + skip_frames)
        elif event.key == 'left':  
            current_frame = seek_frame(current_frame - skip_frames)
            
    fig.canvas.mpl_connect('key_press_event', on_key_press)
    
    def update(frame):
        nonlocal current_frame
        if not paused:
            ret, frame = cap.read()
            if not ret:
                current_frame = 0
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = cap.read()
            
            if ret:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                video_img.set_array(frame)
                
                current_frame_line.set_xdata([current_frame, current_frame])
                
                current_score = smoothened_scores[min(current_frame, len(smoothened_scores)-1)]
                score_text.set_text(f'Current Score: {current_score:.3f}')
                
                if current_score > threshold:
                    current_frame_line.set_color('#ff5555')
                else:
                    current_frame_line.set_color('#ff79c6')
                
                current_frame += 1
                
                if current_frame >= len(scores):
                    current_frame = 0
                    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        
        return [video_img, current_frame_line, score_text]
    
    ani = animation.FuncAnimation(
        fig, update, interval=1000/fps,
        blit=True, cache_frame_data=False
    )

    plt.show(block=True)
    cap.release()

def main(video_path, oversampledCrop, show_plot=False):
    if os.path.isfile(h5_path):
        os.remove(h5_path)
    model, dataloader, bcla = load_model_dataset(video_path, oversampledCrop)
    scores = infer(model, dataloader)
    print(">>> Inference complete")
    smoothened_scores = gaussian_filter1d(scores, sigma=4)
    if show_plot:
        play_video_with_plot(video_path, scores, smoothened_scores)
   
    os.remove(h5_path)
    return bcla
    
def buildFileName(video_file_path):
    import datetime
    timer = datetime.datetime.now().strftime("%d-%m-%Y_%H-%M")
    video_file_name = video_file_path.split('\\')[-1].split('.')[0]
    video_file_name = video_file_name + '_' + timer + '.mp4'
    f = datetime.datetime.now().strftime("%d-%m-%Y_%H-%M")
    return video_file_name

