# MeiboVision 👁️✨

**MeiboVision** (Project MeiboGlands) is an AI-powered ocular diagnostic web application designed for ophthalmologists. It provides precision-driven, automated segmentation and analysis of meibomian glands from eyelid images, enabling medical professionals to evaluate gland morphology and calculate dropout metrics in seconds.

## 🚀 Features

- **Automated AI Segmentation:** Leverages deep learning models (U-Net & Attention U-Net) to accurately segment meibomian glands from inner eyelid images.
- **Real-time Inference:** Fast API-driven backend for quick image processing and streaming.
- **Interactive UI:** A highly polished, responsive frontend built with React, TailwindCSS, and Framer Motion for a seamless user experience.
- **Dark Mode Default:** A modern, clinical dark theme that reduces eye strain in dark clinic rooms.
- **Drag & Drop Upload:** Intuitive file drop zones supporting JPG and PNG images up to 10MB.

## 🛠️ Tech Stack

**Frontend:**
- React (Vite)
- TypeScript
- TailwindCSS & Lucide Icons
- Framer Motion (Animations)

**Backend:**
- Python 3
- FastAPI (REST API & Streaming)
- OpenCV & NumPy (Image Processing)
- PyTorch (Inference with U-Net/AttU-Net models)

## 📂 Project Structure

```
MeiboGlands/
├── backend/               # FastAPI backend application
│   ├── main.py            # API entry point & routes
│   ├── final.py           # ML inference pipeline
│   ├── models/            # Directory containing model weights (.pth)
│   ├── uploads/           # Temporary storage for incoming images
│   └── outputs/           # Output directory for segmented images
├── frontend/              # React + Vite frontend application
│   ├── src/               # UI components, pages, and assets
│   ├── index.html         # Frontend entry point
│   ├── tailwind.config.ts # Styling configuration
│   └── package.json       # Node dependencies
├── requirements.txt       # Python backend dependencies
└── README.md              # Project documentation
```

## 🏁 Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository
```bash
git clone <repository-url>
cd MeiboGlands
```

### 2. Setup the Backend
Requires Python 3.8+.
```bash
# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server (runs on http://127.0.0.1:8000)
cd backend
uvicorn main:app --reload
```

### 3. Setup the Frontend
Requires Node.js 18+.
```bash
# Open a new terminal window/tab
cd frontend

# Install dependencies
npm install

# Start the development server (usually runs on http://localhost:5173)
npm run dev
```

### 4. Access the Application
Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`). Upload an image to see the model in action!

## 📝 Usage

1. Click on **"Analyze"** in the navigation bar to jump to the upload section.
2. Drag and drop a clear image of an everted eyelid into the upload zone, or click to browse files.
3. Click **"Upload & Analyze"**.
4. The image is sent to the backend, processed through the neural networks, and the resulting segmentation map is returned and overlaid seamlessly on the frontend.
