from fastapi import FastAPI, UploadFile, File
import torch
import numpy as np
from clip_interrogator import Config, Interrogator
from supabase import create_client
from PIL import Image
import io
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware



load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Load CLIP
config = Config(clip_model_name="ViT-L-14/openai")
ci = Interrogator(config)

# Load Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ------------------------------
#  Predict Closest Menu Items
# ------------------------------
@app.post("/predict-food")
async def predict_food(file: UploadFile = File(...)):
    img_bytes = await file.read()
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

    # Preprocess + encode uploaded image
    image = ci.clip_preprocess(img).unsqueeze(0).to(ci.device)
    with torch.no_grad():
        features = ci.clip_model.encode_image(image)
        features /= features.norm(dim=-1, keepdim=True)
    query_vector = features.cpu().numpy()[0]

    # Fetch all menu embeddings
    menu = supabase.table("menus").select("dish_id,name,clip_embedding,image_url").execute().data

    results = []
    for item in menu:
        emb = item["clip_embedding"]
        if not emb:
            continue

        emb = np.array(emb)
        similarity = float(np.dot(query_vector, emb))

        results.append({
            "dish_id": item["dish_id"],
            "name": item["name"],
            "image_url": item["image_url"],
            "similarity": similarity
        })

    # Sort descending
    results = sorted(results, key=lambda x: x["similarity"], reverse=True)

    # Top 3 recommendations
    return {"results": results[:3]}
