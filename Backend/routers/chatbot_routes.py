from fastapi import APIRouter
from utils.kb_utils import search_kb
from utils.ollama_utils import query_ollama

router = APIRouter()

@router.post("/")
def chatbot(message: str):
    kb_answer = search_kb(message)
    if kb_answer:
        return {"source": "knowledge_base", "answer": kb_answer}
    ollama_resp = query_ollama(message)
    return {"source": "ollama", "answer": ollama_resp}
