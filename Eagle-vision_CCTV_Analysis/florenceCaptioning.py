import cv2
import os
import torch
from PIL import Image
from transformers import AutoProcessor, AutoModelForCausalLM
from tqdm import tqdm
from multiprocessing import freeze_support

# Load the model
device = "cuda:0" if torch.cuda.is_available() else "cpu"
torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32

model = AutoModelForCausalLM.from_pretrained(
    "microsoft/florence-2-base",
    torch_dtype=torch_dtype,
    trust_remote_code=True
).to(device)

processor = AutoProcessor.from_pretrained(
    "microsoft/florence-2-base",
    trust_remote_code=True
)

def captionSingleFrame(frame):
    """Generates a caption for a single image frame."""
    text = "<MORE_DETAILED_CAPTION>"
    task = "<MORE_DETAILED_CAPTION>"

    inputs = processor(
        text=text,
        images=frame,
        return_tensors="pt"
    ).to(device, torch_dtype)

    generated_ids = model.generate(
        input_ids=inputs["input_ids"],
        pixel_values=inputs["pixel_values"],
        max_new_tokens=4096,
        num_beams=3,
        do_sample=False,
    )
    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
    output = processor.post_process_generation(generated_text, task=task, image_size=(frame.width, frame.height))
    return output['<MORE_DETAILED_CAPTION>']

def generateVideoCaptionCorpus(video_path, place):
    """Processes a video frame by frame and generates captions."""
    os.makedirs("data/documents", exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_count = 0
    captions = []

    with tqdm(total=total_frames, desc="Processing Video") as pbar:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_count % fps == 0:  # Process one frame per second
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame_pil = Image.fromarray(frame_rgb)

                try:
                    caption = captionSingleFrame(frame_pil)
                    timestamp = frame_count // fps
                    hours = timestamp // 3600
                    minutes = (timestamp % 3600) // 60
                    seconds = timestamp % 60
                    timestamp_str = f"[{hours}:{minutes:02}:{seconds:02}]"
                    captions.append(f"Timestamp: {timestamp_str} || Place: {place} || Caption: {caption}")
                except Exception as e:
                    print(f"Error processing frame at {frame_count}: {str(e)}")

            frame_count += 1
            pbar.update(1)

    cap.release()

    output_file = os.path.join("data/documents", f"{place}.txt")
    with open(output_file, 'w', encoding='utf-8') as f:
        for caption in captions:
            f.write(caption + '\n')

    print(f"Captions saved to {output_file}")

if __name__ == '__main__':
    freeze_support()
    generateVideoCaptionCorpus(
        video_path=rf"C:\Users\iampr\OneDrive\Desktop\Hackverse_2025-Team_Matrix-main\Hackverse_2025-Team_Matrix-main\Zensafe_Web_Application\frontend\public\videos\1.mp4",
        place="Hello"
    )

