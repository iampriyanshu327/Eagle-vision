import cv2
import os
import torch
from PIL import Image
from transformers import AutoProcessor, AutoModelForCausalLM
from tqdm import tqdm
from multiprocessing import freeze_support

# Load the model and processor once (globally)
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

if __name__ == '__main__':
    freeze_support()
    generateVideoCaptionCorpus(
        video_path=rf"C:\Users\iampr\OneDrive\Desktop\Hackverse_2025-Team_Matrix-main\Hackverse_2025-Team_Matrix-main\Zensafe_Web_Application\frontend\public\videos\1.mp4",
        place="Hello"
    )
