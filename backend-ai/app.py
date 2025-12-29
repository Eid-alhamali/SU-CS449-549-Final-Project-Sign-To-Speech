
import sys
import os
import uvicorn
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import json
import torch
import numpy as np
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add current directory to path to find CNNModel
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(current_dir, "Sign Language Recognition"))

try:
    from CNNModel import CNNModel
except ImportError:
    # Fallback if running from root
    sys.path.append(os.path.join(current_dir, "backend-ai", "Sign Language Recognition"))
    from CNNModel import CNNModel

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
model = CNNModel()
model_path = os.path.join(current_dir, "Sign Language Recognition", "CNN_model_alphabet_SIBI.pth")

try:
    if os.path.exists(model_path):
        model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        model.eval()
        logger.info(f"Model loaded successfully from {model_path}")
    else:
        logger.error(f"Model file not found at {model_path}")
except Exception as e:
    logger.error(f"Error loading model: {e}")

classes = {
    'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7, 
    'I': 8, 'J': 9, 'K': 10, 'L': 11, 'M': 12, 'N': 13, 'O': 14, 
    'P': 15, 'Q': 16, 'R': 17, 'S': 18, 'T': 19, 'U': 20, 'V': 21, 
    'W': 22, 'X': 23, 'Y': 24, 'Z': 25
}
idx_to_class = {v: k for k, v in classes.items()}

@app.websocket("/ws/predict")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection established")
    try:
        while True:
            data = await websocket.receive_text()
            try:
                landmarks = json.loads(data)
                
                if not landmarks or len(landmarks) != 21:
                    continue
                    
                # Preprocessing
                x_coords = [lm['x'] for lm in landmarks]
                y_coords = [lm['y'] for lm in landmarks]
                z_coords = [lm['z'] for lm in landmarks]
                
                min_x, min_y, min_z = min(x_coords), min(y_coords), min(z_coords)
                
                # Create input vector (63 features: x, y, z for each of 21 landmarks)
                input_vector = []
                for lm in landmarks:
                    input_vector.append(lm['x'] - min_x)
                    input_vector.append(lm['y'] - min_y)
                    input_vector.append(lm['z'] - min_z)
                    
                # Reshape for model: (Batch Size, Channels, Length) -> (1, 63, 1)
                input_tensor = torch.tensor(input_vector, dtype=torch.float32).reshape(1, 63, 1)
                
                with torch.no_grad():
                    outputs = model(input_tensor)
                    _, predicted = torch.max(outputs.data, 1)
                    prediction = idx_to_class.get(predicted.item(), "?")
                    
                await websocket.send_text(prediction)
                
            except json.JSONDecodeError:
                logger.error("Invalid JSON received")
            except Exception as e:
                logger.error(f"Prediction error: {e}")
                
    except Exception as e:
        logger.error(f"WebSocket disconnected: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
