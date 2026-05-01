from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse,StreamingResponse
from final import run_pipeline
from io import BytesIO
import os
import cv2
from fastapi.middleware.cors import CORSMiddleware
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "MeiboGlands Backend"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/infer")
async def infer(file:UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)
    with open(f"uploads/{file.filename}", "wb") as f:
        f.write(await file.read())

    run_pipeline(
        image_path=f"uploads/{file.filename}",
        attunet_weights_path=r"models\Final.pth",
        unet_weights_path=r"models\unet_meibo.pth",
        output_dir="outputs"
    )

    result_image_path = "outputs/overlay_unet.png"

    with open(result_image_path, "rb") as image_file:
        image_data = image_file.read()

    return StreamingResponse(BytesIO(image_data), media_type="image/png")