import subprocess

def query_ollama(prompt: str):
    try:
        result = subprocess.run(
            ["ollama", "run", "mistral", prompt],
            capture_output=True, text=True, timeout=20
        )
        return result.stdout.strip()
    except Exception as e:
        return f"Ollama error: {e}"
