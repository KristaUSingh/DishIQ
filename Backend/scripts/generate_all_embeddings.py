from clip_interrogator import Config, Interrogator
import requests
import numpy as np
from PIL import Image
import io
from supabase import create_client
from dotenv import load_dotenv
import os
import torch

load_dotenv()

# ------------------------------
# Load CLIP Interrogator
# ------------------------------
print("Loading CLIP model...")
config = Config(
    clip_model_name="ViT-L-14/openai",
    caption_model_name="blip-large",
)
ci = Interrogator(config)

# ------------------------------
# Supabase Setup
# ------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ------------------------------
# Fetch Menu
# ------------------------------
print("Fetching menu items...")
menu = supabase.table("menus").select("*").execute().data

for item in menu:
    dish_id = item["dish_id"]
    url = item["image_url"]

    if not url:
        print(f"⚠️ Skipping {dish_id} ({item['name']}) — no image_url")
        continue

    try:
        print(f"\nProcessing dish {dish_id} → {item['name']}")

        # Download image
        img_bytes = requests.get(url, timeout=10).content
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # ---- FIX: Access the CLIP model directly ----
        # Preprocess the image and get features from the underlying CLIP model
        image = ci.clip_preprocess(img).unsqueeze(0).to(ci.device)
        
        with torch.no_grad():
            image_features = ci.clip_model.encode_image(image)
            image_features /= image_features.norm(dim=-1, keepdim=True)
        
        embedding = image_features.cpu().numpy()[0].tolist()

        # Save embedding
        supabase.table("menus").update({
            "clip_embedding": embedding
        }).eq("dish_id", dish_id).execute()

        print(f"✅ Saved embedding for {item['name']}")

    except Exception as e:
        print(f"❌ ERROR for dish {dish_id} ({item['name']}): {e}")

print("\n🎉 DONE: All embeddings generated and saved!")