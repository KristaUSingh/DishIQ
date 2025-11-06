# utils/clip_utils.py
from PIL import Image
import torch
import clip  # Changed from clip_anytorch
import json

device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)  # Changed from load to clip.load

async def find_similar_dishes(file):
    """
    Compare an uploaded dish image to stored menu embeddings.
    Returns the top 3 visually similar dishes.
    """
    try:
        # Read the uploaded image
        image = Image.open(file.file).convert("RGB")
        image_input = preprocess(image).unsqueeze(0).to(device)

        # Load menu embeddings (pre-computed)
        with open("menu_embeddings.json", "r") as f:
            menu_data = json.load(f)

        similarities = []
        with torch.no_grad():
            img_features = model.encode_image(image_input)

        # Compute cosine similarity
        for item in menu_data:
            embedding = torch.tensor(item["embedding"], dtype=torch.float32).unsqueeze(0).to(device)
            score = torch.cosine_similarity(img_features, embedding)
            similarities.append({
                "name": item["name"],
                "score": float(score)
            })

        # Sort and return top matches
        top_matches = sorted(similarities, key=lambda x: x["score"], reverse=True)[:3]
        return top_matches

    except Exception as e:
        return {"error": str(e)}