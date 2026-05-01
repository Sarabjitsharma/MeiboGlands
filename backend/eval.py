import os
import numpy as np
import cv2 
from tqdm import tqdm
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
import albumentations as A
from albumentations.pytorch import ToTensorV2
import torch.nn.functional as F


class AttentionBlock(nn.Module):
    def __init__(self, F_g, F_l, F_int):
        super(AttentionBlock, self).__init__()
        self.W_g = nn.Sequential(
            nn.Conv2d(F_g, F_int, kernel_size=1, stride=1, padding=0, bias=True),
            nn.BatchNorm2d(F_int)
        )

        self.W_x = nn.Sequential(
            nn.Conv2d(F_l, F_int, kernel_size=1, stride=1, padding=0, bias=True),
            nn.BatchNorm2d(F_int)
        )

        self.psi = nn.Sequential(
            nn.Conv2d(F_int, 1, kernel_size=1, stride=1, padding=0, bias=True),
            nn.BatchNorm2d(1),
            nn.Sigmoid()
        )

        self.relu = nn.ReLU(inplace=True)

    def forward(self, g, x):
        g1 = self.W_g(g)
        x1 = self.W_x(x)
        psi = self.relu(g1 + x1)
        psi = self.psi(psi)
        return x * psi


class AttentionUNet(nn.Module):
    def __init__(self):
        super(AttentionUNet, self).__init__()

        def conv_block(in_channels, out_channels):
            return nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True)
            )

        self.pool = nn.MaxPool2d(2)

        self.enc1 = conv_block(1, 64)
        self.enc2 = conv_block(64, 128)
        self.enc3 = conv_block(128, 256)
        self.enc4 = conv_block(256, 512)

        self.bottleneck = conv_block(512, 1024)

        self.upconv4 = nn.ConvTranspose2d(1024, 512, kernel_size=2, stride=2)
        self.att4 = AttentionBlock(F_g=512, F_l=512, F_int=256)
        self.dec4 = conv_block(1024, 512)

        self.upconv3 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.att3 = AttentionBlock(F_g=256, F_l=256, F_int=128)
        self.dec3 = conv_block(512, 256)

        self.upconv2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.att2 = AttentionBlock(F_g=128, F_l=128, F_int=64)
        self.dec2 = conv_block(256, 128)

        self.upconv1 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
        self.att1 = AttentionBlock(F_g=64, F_l=64, F_int=32)
        self.dec1 = conv_block(128, 64)

        self.conv_last = nn.Conv2d(64, 1, kernel_size=1)

    def forward(self, x):
        enc1 = self.enc1(x)
        enc2 = self.enc2(self.pool(enc1))
        enc3 = self.enc3(self.pool(enc2))
        enc4 = self.enc4(self.pool(enc3))

        bottleneck = self.bottleneck(self.pool(enc4))

        up4 = self.upconv4(bottleneck)
        att4 = self.att4(g=up4, x=enc4)
        dec4 = self.dec4(torch.cat((att4, up4), dim=1))

        up3 = self.upconv3(dec4)
        att3 = self.att3(g=up3, x=enc3)
        dec3 = self.dec3(torch.cat((att3, up3), dim=1))

        up2 = self.upconv2(dec3)
        att2 = self.att2(g=up2, x=enc2)
        dec2 = self.dec2(torch.cat((att2, up2), dim=1))

        up1 = self.upconv1(dec2)
        att1 = self.att1(g=up1, x=enc1)
        dec1 = self.dec1(torch.cat((att1, up1), dim=1))

        return torch.sigmoid(self.conv_last(dec1))



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

        self.upconv4 = nn.ConvTranspose2d(1024, 512, kernel_size=2, stride=2)
        self.dec4 = conv_block(1024, 512)

        self.upconv3 = nn.ConvTranspose2d(512, 256, kernel_size=2, stride=2)
        self.dec3 = conv_block(512, 256)

        self.upconv2 = nn.ConvTranspose2d(256, 128, kernel_size=2, stride=2)
        self.dec2 = conv_block(256, 128)

        self.upconv1 = nn.ConvTranspose2d(128, 64, kernel_size=2, stride=2)
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


def predict(model, image_path, device):
    model.eval()
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    orig = image.copy()
    transform = A.Compose([
        A.Resize(256,256),
        A.Normalize(mean=0.0, std=1.0, max_pixel_value=255.0),
        ToTensorV2()
    ])
    augmented = transform(image=image)
    image_tensor = augmented['image'].unsqueeze(0).to(device)
    with torch.no_grad():
        pred = model(image_tensor)
        pred = (pred.squeeze().cpu().numpy() > 0.5).astype(np.uint8) * 255

    return cv2.resize(pred, (orig.shape[1], orig.shape[0]))

def overlay_prediction(original_path, pred_mask):
    original = cv2.imread(original_path)
    if len(original.shape) == 2 or original.shape[2] == 1:
        original = cv2.cvtColor(original, cv2.COLOR_GRAY2BGR)
    mask_colored = cv2.cvtColor(pred_mask, cv2.COLOR_GRAY2BGR)
    mask_colored[:, :, 1:] = 0  
    overlay = cv2.addWeighted(original, 1.0, mask_colored, 0.4, 0)
    return overlay

def evaluate_and_save(model, image_folder, output_folder, device):
    os.makedirs(output_folder, exist_ok=True)
    model.eval()
    image_list = [f for f in os.listdir(image_folder) if f.endswith(('.png', '.jpg','.JPG'))]
    for img_name in tqdm(image_list, desc="Evaluating"):
        image_path = os.path.join(image_folder, img_name)
        pred_mask = predict(model, image_path, device)
        overlay = overlay_prediction(image_path, pred_mask)

        out_path = os.path.join(output_folder, f"overlay_{img_name}")
        cv2.imwrite(out_path, overlay)
        

import base64
def evaluate_and_return_base64(model, image_folder, device):
    image_list = [f for f in os.listdir(image_folder) if f.endswith(('.png', '.jpg', '.JPG'))]
    result_images = []
    for img_name in tqdm(image_list, desc="Evaluating"):
        image_path = os.path.join(image_folder, img_name)
        
        # Make prediction (or process the image with your model)
        pred_mask = predict(model, image_path, device)
        
        # Overlay prediction on the image
        overlay = overlay_prediction(image_path, pred_mask)
        
        # Convert the overlayed image to Base64
        _, buffer = cv2.imencode('.jpg', overlay)
        base64_str = base64.b64encode(buffer).decode('utf-8')
        
        # Add the Base64 string to the result list
        result_images.append({
            'image_name': img_name,
            'base64_image': base64_str
        })
        
    return result_images


if __name__ == '__main__':
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = AttentionUNet().to(DEVICE)
    model.load_state_dict(torch.load("Final.pth"))
    # model = UNet().to(DEVICE)
    # model.load_state_dict(torch.load("unet_meibo.pth"))
    model.eval()

    evaluate_and_save(
        model=model,
        image_folder="extracted original images",    
        output_folder="latest",   
        device=DEVICE
    )
# 

# if __name__ == '__main__':
#     DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#     model =  AttentionUNet().to(DEVICE) #UNet().to(DEVICE)
#     model.load_state_dict(torch.load("unet_meibo_Step1.pth"))
#     model.eval()

    # evaluate_and_save_with_gt(
    #     model=model,
    #     image_folder="Original Images",
    #     gt_folder="Eyelid Lebels",
    #     output_folder="Output/mask3",
    #     device=DEVICE
    # )
    # evaluate_and_save_with_gt(
    #     model=model,
    #     image_folder="extracted original images",
    #     gt_folder="Meibomian Gland Labels",
    #     output_folder="Output/mask7",
    #     device=DEVICE
    # )
