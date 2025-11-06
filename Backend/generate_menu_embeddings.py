# generate_menu_embeddings.py
from PIL import Image
import torch
import clip
import json
import os

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

# Folder with menu images (one image per dish)
menu_folder = "menu_images"

menu_data = []

for filename in os.listdir(menu_folder):
    if filename.lower().endswith((".jpg", ".jpeg", ".png")):
        path = os.path.join(menu_folder, filename)
        dish_name = os.path.splitext(filename)[0].replace("_", " ").title()
        image = preprocess(Image.open(path).convert("RGB")).unsqueeze(0).to(device)

        with torch.no_grad():
            embedding = model.encode_image(image).cpu().numpy().flatten().tolist()

        menu_data.append({
            "name": dish_name,
            "embedding": embedding
        })

# Save as JSON
with open("menu_embeddings.json", "w") as f:
    json.dump(menu_data, f, indent=2)

print(f"✅ Generated {len(menu_data)} menu embeddings (512-dim) and saved to menu_embeddings.json")
