import torch
import torch.nn as nn
import os
import cv2
import numpy as np

import albumentations as A
from albumentations.pytorch import ToTensorV2
from eval import AttentionUNet  # your AttentionUNet import

class UNet(nn.Module):
    def __init__(self):
        super(UNet, self).__init__()
        def conv_block(in_channels, out_channels):
            return nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True)
            )
        self.enc1 = conv_block(1, 64)
        self.enc2 = conv_block(64, 128)
        self.enc3 = conv_block(128, 256)
        self.enc4 = conv_block(256, 512)
        self.pool = nn.MaxPool2d(2)
        self.bottleneck = conv_block(512, 1024)

        self.upconv4 = nn.ConvTranspose2d(1024, 512, 2, 2)
        self.dec4 = conv_block(1024, 512)
        self.upconv3 = nn.ConvTranspose2d(512, 256, 2, 2)
        self.dec3 = conv_block(512, 256)
        self.upconv2 = nn.ConvTranspose2d(256, 128, 2, 2)
        self.dec2 = conv_block(256, 128)
        self.upconv1 = nn.ConvTranspose2d(128, 64, 2, 2)
        self.dec1 = conv_block(128, 64)
        self.conv_last = nn.Conv2d(64, 1, kernel_size=1)

    def forward(self, x):
        enc1 = self.enc1(x)
        enc2 = self.enc2(self.pool(enc1))
        enc3 = self.enc3(self.pool(enc2))
        enc4 = self.enc4(self.pool(enc3))
        bottleneck = self.bottleneck(self.pool(enc4))

        dec4 = self.upconv4(bottleneck)
        dec4 = torch.cat((enc4, dec4), dim=1)
        dec4 = self.dec4(dec4)

        dec3 = self.upconv3(dec4)
        dec3 = torch.cat((enc3, dec3), dim=1)
        dec3 = self.dec3(dec3)

        dec2 = self.upconv2(dec3)
        dec2 = torch.cat((enc2, dec2), dim=1)
        dec2 = self.dec2(dec2)

        dec1 = self.upconv1(dec2)
        dec1 = torch.cat((enc1, dec1), dim=1)
        dec1 = self.dec1(dec1)

        return torch.sigmoid(self.conv_last(dec1))


def preprocess_for_attunet(image):
    # Your preprocessing (same as before)
    if image.shape[-1] == 3:
        gray_img = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray_img = image

    _, glare_mask = cv2.threshold(gray_img, 250, 255, cv2.THRESH_BINARY)
    glare_mask = cv2.dilate(glare_mask, np.ones((3, 3), np.uint8), iterations=1)
    glare_removed = cv2.inpaint(gray_img, glare_mask, 3, cv2.INPAINT_TELEA)

    median_filtered = cv2.medianBlur(glare_removed, 3)
    clahe = cv2.createCLAHE(clipLimit=3.0)
    contrast_enhanced = clahe.apply(median_filtered)
    blurred = cv2.GaussianBlur(contrast_enhanced, (0, 0), 3)
    sharpened = cv2.addWeighted(contrast_enhanced, 1.3, blurred, -0.3, 0)

    gamma = 0.95
    table = np.array([(i / 255.0) ** (1.0 / gamma) * 255 for i in range(256)]).astype("uint8")
    gamma_corrected = cv2.LUT(sharpened, table)

    return gamma_corrected


def predict_attentionunet(model, img, device):
    model.eval()
    processed = preprocess_for_attunet(img)

    transform = A.Compose([
        A.Resize(256, 256),
        A.Normalize(mean=0.0, std=1.0, max_pixel_value=255.0),
        ToTensorV2()
    ])

    augmented = transform(image=processed)
    image_tensor = augmented['image'].unsqueeze(0).to(device)

    with torch.no_grad():
        pred = model(image_tensor)
        pred_np = pred.squeeze().cpu().numpy()
        mask = (pred_np > 0.5).astype(np.uint8) * 255

    mask_resized = cv2.resize(mask, (img.shape[1], img.shape[0]))
    return mask_resized


def extract_masked_region(original_img, mask):
    if len(mask.shape) == 3:
        mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
    mask_bin = (mask > 127).astype(np.uint8)

    if len(original_img.shape) == 3 and original_img.shape[2] == 3:
        masked_img = original_img.copy()
        for c in range(3):
            masked_img[:, :, c] = masked_img[:, :, c] * mask_bin
    else:
        masked_img = original_img * mask_bin

    return masked_img


def preprocess_masked_image_for_unet(masked_img):
    if len(masked_img.shape) == 3 and masked_img.shape[2] == 3:
        gray = cv2.cvtColor(masked_img, cv2.COLOR_BGR2GRAY)
    else:
        gray = masked_img

    resized = cv2.resize(gray, (256, 256))
    norm = resized / 255.0
    return norm.astype(np.float32)


def predict_unet(model, masked_img, device):
    model.eval()
    input_processed = preprocess_masked_image_for_unet(masked_img)
    input_tensor = torch.from_numpy(input_processed).unsqueeze(0).unsqueeze(0).to(device)  # shape (1,1,H,W)

    with torch.no_grad():
        pred = model(input_tensor)
        pred_np = pred.squeeze().cpu().numpy()
        mask_out = (pred_np > 0.5).astype(np.uint8) * 255

    return mask_out


def overlay_mask_on_image(image, mask, color=(0, 0, 255), alpha=0.4):
    overlay = image.copy()
    colored_mask = np.zeros_like(image)
    colored_mask[:, :, 2] = mask

    cv2.addWeighted(colored_mask, alpha, overlay, 1 - alpha, 0, overlay)
    return overlay


def run_pipeline(
    image_path,
    attunet_weights_path,
    unet_weights_path,
    output_dir="Step2"
):
    os.makedirs(output_dir, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    original_img = cv2.imread(image_path)
    if original_img is None:
        raise FileNotFoundError(f"Image not found at {image_path}")

    model_attunet = AttentionUNet().to(device)
    model_unet = UNet().to(device)

    model_attunet.load_state_dict(torch.load(attunet_weights_path, map_location=device))
    model_unet.load_state_dict(torch.load(unet_weights_path, map_location=device))

    # Step 1: Predict mask with AttentionUNet
    attunet_mask = predict_attentionunet(model_attunet, original_img, device)
    cv2.imwrite(os.path.join(output_dir, "attunet_mask.png"), attunet_mask)

    # Step 2: Extract masked region from original image
    extracted_img = extract_masked_region(original_img, attunet_mask)
    cv2.imwrite(os.path.join(output_dir, "extracted_masked_image.png"), extracted_img)

    # Step 3: Feed extracted image into UNet
    unet_mask = predict_unet(model_unet, extracted_img, device)
    cv2.imwrite(os.path.join(output_dir, "unet_mask.png"), unet_mask)

    # Resize unet_mask to original image size for overlay
    unet_mask_resized = cv2.resize(unet_mask, (original_img.shape[1], original_img.shape[0]))

    # Overlays
    overlay_attunet = overlay_mask_on_image(original_img, attunet_mask)
    overlay_unet = overlay_mask_on_image(original_img, unet_mask_resized)

    cv2.imwrite(os.path.join(output_dir, "overlay_attunet.png"), overlay_attunet)
    cv2.imwrite(os.path.join(output_dir, "overlay_unet.png"), overlay_unet)


# if __name__ == "__main__":
#     run_pipeline(
#         image_path=r"D:\Computer Science\Projects\Meibo API\Original Images\DMI_OD_LOWER_REFLECTED_IR_447359.JPG",
#         attunet_weights_path="Final.pth",
#         unet_weights_path="unet_meibo.pth",
#         output_dir="outputs"
#     )
