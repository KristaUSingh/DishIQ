from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import torch
import numpy as np
from clip_interrogator import Config, Interrogator
from supabase import create_client
from PIL import Image
import io
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# ---------------------------------------------------------
# CORS (VERY IMPORTANT for your React frontend to connect)
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# LOAD CLIP INTERROGATOR
# ---------------------------------------------------------
print("Loading CLIP model...")
config = Config(
    clip_model_name="ViT-L-14/openai",
    caption_model_name="blip-large"
)
ci = Interrogator(config)
print("CLIP model loaded.")

# ---------------------------------------------------------
# SUPABASE SETUP
# ---------------------------------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("❌ Missing Supabase environment variables!")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# =========================================================
# ⭐ HELPER: ENCODE AN IMAGE INTO A CLIP VECTOR
# =========================================================
def encode_image_to_clip(img: Image.Image):
    image = ci.clip_preprocess(img).unsqueeze(0).to(ci.device)

    with torch.no_grad():
        features = ci.clip_model.encode_image(image)
        features /= features.norm(dim=-1, keepdim=True)

    return features.cpu().numpy()[0]


# =========================================================
# ⭐ HELPER: RUN SIMILARITY AGAINST MENU EMBEDDINGS
# =========================================================
def find_closest_menu_items(query_vector):
    menu = supabase.table("menus").select(
        "dish_id,name,restaurant_name,image_url,clip_embedding"
    ).execute().data


    results = []
    for item in menu:
        emb = item["clip_embedding"]
        if not emb:
            continue

        # 🔥 FIX: Handle embeddings stored as a STRING
        if isinstance(emb, str):  
            emb = emb.strip("[]")                   # remove brackets
            emb = emb.split(",")                    # split values
            emb = [float(x) for x in emb]           # convert each to float

        # Convert final embedding into numpy vector
        emb = np.array(emb, dtype=float)

        # Compute cosine similarity (dot product normalized)
        similarity = float(np.dot(query_vector, emb))

        results.append({
            "dish_id": item["dish_id"],
            "name": item["name"],
            "restaurant_name": item["restaurant_name"],
            "image_url": item["image_url"],
            "similarity": similarity
        })

    return sorted(results, key=lambda x: x["similarity"], reverse=True)[:3]



# =========================================================
# 📌 ROUTE 1: FILE UPLOAD PREDICTION
# =========================================================
@app.post("/predict-food")
async def predict_food(file: UploadFile = File(...)):
    img_bytes = await file.read()
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

    query_vector = encode_image_to_clip(img)
    top_matches = find_closest_menu_items(query_vector)

    return {"results": top_matches}


# =========================================================
# 📌 ROUTE 2: URL PREDICTION
# =========================================================
@app.post("/predict-food-url")
async def predict_food_url(url: str = Form(...)):
    try:
        response = requests.get(url, timeout=10)
        img = Image.open(io.BytesIO(response.content)).convert("RGB")
    except Exception:
        return {"error": "Invalid or inaccessible image URL."}

    query_vector = encode_image_to_clip(img)
    top_matches = find_closest_menu_items(query_vector)

    return {"results": top_matches}


# =========================================================
# ROOT TEST
# =========================================================
@app.get("/")
def home():
    return {"status": "Food Finder API is running!"}
