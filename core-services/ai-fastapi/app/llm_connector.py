import os
import asyncio
from google import genai
from groq import Groq

# Config
GEMINI_MODEL = "gemini-1.5-flash"
GROQ_MODEL = "llama-3.3-70b-versatile"

# Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Clients
gemini_client = genai.Client(api_key=GEMINI_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)


async def generate_ai_response(prompt_data: str):
    """
    Attempts to generate a response using Gemini (2 tries) 
    then falls back to Groq (2 tries).
    """

    # --- PHASE 1: GEMINI ---
    for i in range(1, 3):
        print(f"Attempt {i}: Trying {GEMINI_MODEL}...")
        try:
            response = gemini_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt_data
            )
            return response.text
        except Exception as e:
            print(f"FAILED {GEMINI_MODEL} Attempt {i}: {e}")
            # Wait 1 second before retrying to clear temporary spikes
            await asyncio.sleep(1)

    # --- PHASE 2: GROQ ---
    for i in range(1, 3):
        print(f"Attempt {i}: Trying {GROQ_MODEL} (Backup)...")
        try:
            completion = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[{"role": "user", "content": prompt_data}]
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"FAILED {GROQ_MODEL} Attempt {i}: {e}")
            await asyncio.sleep(1)

    return "Error: All models (Gemini & Groq) failed after 4 total attempts."