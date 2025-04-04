import cv2
import h5py
import os
from tqdm import tqdm
import numpy as np

"""
For training speed, we translate the video datasets into a single h5py file for reducing the indexing time in Disk
By keeping the compressed type as JPG, we can reduce the memory space

Here, we give the example as translating UCF-Crime training set into a single h5py file, you can modify it for other dataset
OR
You can modify the datasets/dataset.py for directly using the video files for testing!

"""


def Video2ImgH5(video_dir,h5_path,train_list,segment_len=16,max_vid_len=2000):
    
    h=h5py.File(h5_path,'a')
    for path in tqdm(train_list):
        vc=cv2.VideoCapture(os.path.join(video_dir,path))
        vid_len=vc.get(cv2.CAP_PROP_FRAME_COUNT)
        for i in tqdm(range(int(vid_len//segment_len))):
            tmp_frames=[]
            key=path.split('/')[-1].split('.')[0]+'-{0:06d}'.format(i)
            for j in range(segment_len):
                ret,frame=vc.read()
                _,frame=cv2.imencode('.JPEG',frame)
                frame=np.array(frame).tostring()
                if ret:
                    tmp_frames.append(frame)
                else:
                    print('Bug Reported!')
                    exit(-1)
            tmp_frames = np.asarray(tmp_frames)
            h.create_dataset(key,data=tmp_frames,chunks=True)
        print(path)

    print('finished!')


def Video2ImgH5_single(video_path, h5_path, segment_len=16, max_vid_len=10000000):
    """
    Convert a video to frames and save them as an H5 file for I3D model inference.
    Args:
        video_path (str): Path to the input video file.
        h5_path (str): Path to save the resulting H5 file.
        segment_len (int): The number of frames to process together in one batch.
        max_vid_len (int): Maximum video length in frames to process.
    """
    
    try:
        # Open the H5 file in append mode
        with h5py.File(h5_path, 'a') as h:
            
            # Open the video capture
            vc = cv2.VideoCapture(video_path)
            if not vc.isOpened():
                raise ValueError(f"Could not open video file {video_path}")
            
            vid_len = int(vc.get(cv2.CAP_PROP_FRAME_COUNT))
            vid_len = min(vid_len, max_vid_len)  # Limit video length to max_vid_len
            vidi = video_path.split('\\')[-1]
            print(f">>> Processing video {vidi} with {vid_len} frames.")
            
            # Process the video in segments of length `segment_len`
            for i in range(int(vid_len // segment_len)):
                tmp_frames = []
                key = os.path.basename(video_path).split('.')[0] + '-{0:06d}'.format(i)
                
                for j in range(segment_len):
                    ret, frame = vc.read()
                    if not ret:
                        print('Error reading frame, exiting...')
                        break  # Exit if frame reading fails
                    
                    # Resize or preprocess frame if needed
                    # frame = cv2.resize(frame, (224, 224))  # Uncomment if resizing is needed
                    
                    _, frame = cv2.imencode('.JPEG', frame)  # Encode frame to JPEG format
                    frame = np.array(frame).tobytes()  # Convert to bytes
                    tmp_frames.append(frame)
                
                # Check if frames were read
                if len(tmp_frames) == segment_len:
                    tmp_frames = np.asarray(tmp_frames)
                    # If dataset exists, delete it before creating new one
                    if key in h:
                        del h[key]  # Delete existing dataset with the same name
                    h.create_dataset(key, data=tmp_frames, chunks=True)
                else:
                    print(f"Error: Could not read enough frames for segment {i}.")
                    break  # Stop processing if not enough frames were read
            
            # print(f"Video processed and saved to H5 file {h5_path}.")
    except Exception as e:
        print(f"Error creating H5 file: {e}")
        raise

if __name__ == '__main__':
    video_path = r"C:\Users\pavan\Downloads\CCTV3.mp4" # Specify your video path here
    h5_file_path = r"C:\Users\pavan\Downloads\CCTV3.h5"  # Specify your H5 file path here
    
    Video2ImgH5_single(video_path, h5_file_path, segment_len=16)



    # video_dir = r"C:\Users\pavan\Downloads\Testing_Videos_UCF" # Specify your video path here
    # h5_file_dir = r"C:\Users\pavan\Downloads\Testing_Videos_UCF_H5"  # Specify your H5 file path here

    # count = 1
    # # Call the function to convert the video to an H5 file
    # for file in os.listdir(video_dir):
    #     print(count)
    #     count += 1
    #     video_file_path = os.path.join(video_dir, file)
    #     h5_file_path = os.path.join(h5_file_dir, f"{file.split('.')[0]}.h5")
    #     Video2ImgH5_single(video_file_path, h5_file_path, segment_len=16)








# if __name__=='__main__':
#     video_dir='/data0/jiachang/Anomaly-Videos/'
#     h5_file_path='/data0/jiachang/UCFCrime-Frames-16.h5'
#     txt_path='/data0/jiachang/Weakly_Supervised_VAD/Datasets/Anomaly_Train.txt'
#     train_list=[]
#     with open(txt_path,'r')as f:
#         paths=f.readlines()
#         for path in paths:
#             ano_type=path.strip().split('/')[0]
#             if 'Normal' in ano_type:
#                 path='Normal/'+path.strip().split('/')[-1]
                
#             train_list.append(path.strip())
#     print(train_list)
#     Video2ImgH5(video_dir,h5_file_path,train_list,segment_len=16)
