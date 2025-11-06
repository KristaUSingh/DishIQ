import json
from difflib import SequenceMatcher

def search_kb(user_query: str):
    with open("knowledge_base.json", "r") as f:
        kb = json.load(f)
    best_match = None
    highest_ratio = 0
    for q, a in kb.items():
        ratio = SequenceMatcher(None, user_query.lower(), q.lower()).ratio()
        if ratio > highest_ratio:
            best_match = a
            highest_ratio = ratio
    return best_match if highest_ratio > 0.6 else None
