import os
from google import genai

# Configuration - Easy to replace model later on
MODEL_NAME = "gemini-2.5-flash"
API_KEY = os.getenv("AI_API_KEY")

# Initialize Client (Handles connection with LLM and data transfer)
client = genai.Client(api_key=API_KEY)

async def generate_ai_response(prompt_data: str):
    print("Current model used: " + MODEL_NAME)
    # Takes data in parameter and returns the AI response.
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt_data
        )
        return response.text
    except Exception as e:
        return f"Error: {e}"