from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse,StreamingResponse
from final import run_pipeline
from io import BytesIO
import cv2
import numpy as np

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "MeiboGlands Backend"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/infer")
async def infer(file:UploadFile = File(...)):
    image_bytes = await file.read()
    image_array = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    run_pipeline(
        image_path=image,
        attunet_weights_path=r"backend\models\Final.pth",
        unet_weights_path=r"backend\models\unet_meibo.pth",
        output_dir="outputs"
    )
    # buffer = BytesIO()
    # img = 

    return JSONResponse({"message": "Inference completed successfully"})
