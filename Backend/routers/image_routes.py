from fastapi import APIRouter, UploadFile, File
from utils.clip_utils import find_similar_dishes

router = APIRouter()

@router.post("/")
async def image_search(file: UploadFile = File(...)):
    results = await find_similar_dishes(file)
    return {"results": results}
