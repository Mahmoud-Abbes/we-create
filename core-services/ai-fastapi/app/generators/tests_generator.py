import os
from app.llm_connector import generate_ai_response

async def run_welcoming_test():
    # AI generated welcoming text for connectivity test
    # Calling the logic in llm_connector.py
    prompt = "Generate a short, english, single variant, random welcoming text for a new web developer with 5 maximum words."
    return await generate_ai_response(prompt)

def get_system_status():
    # Status and API_KEY availibility test
    return {
        "status": "online",  
        }