import json
import os
from app.llm_connector import generate_ai_response

# --- PATH SETUP ---
# 1. Get the folder where THIS file (showcase_generator.py) is located
CURRENT_FOLDER = os.path.dirname(os.path.abspath(__file__))

# 2. Go UP one level and then into the 'instructions' folder to find the text file
# This ensures the script finds the file whether it's running in Docker or locally
INSTRUCTIONS_PATH = os.path.join(CURRENT_FOLDER, "..", "instructions", "showcase_instructions.txt")

async def generate_showcase_data(user_context: dict):
    """
    Main logic to turn raw user text into the website JSON configuration.
    """

    # --- STEP 1: LOAD THE BRAIN (Instructions) ---
    # 'with open' safely opens the file and 'as f' gives us a handle to read it.
    # It automatically closes the file when the block ends.
    try:
        with open(INSTRUCTIONS_PATH, "r", encoding="utf-8") as file_handle:
            instructions_text = file_handle.read()
    except FileNotFoundError:
        return {"success": False, "error": f"Could not find instruction file at {INSTRUCTIONS_PATH}"}

    # --- STEP 2: PREPARE THE PROMPT ---
    # Convert the user's dictionary into a pretty-printed string for the AI
    formatted_user_data = json.dumps(user_context, indent=2)
    
    full_prompt = (
        f"{instructions_text}\n\n"
        f"USER DATA TO PROCESS:\n"
        f"{formatted_user_data}"
    )

    # --- STEP 3: CONTACT THE AI ---
    raw_ai_text = await generate_ai_response(full_prompt)

    # --- STEP 4: CHECK FOR OBLIGATORY FIELD ERRORS ---
    # In your instructions, you told the AI to return "Generation failed" if data is missing.
    # We check if that specific phrase is in the AI's response.
    if "Generation failed" in raw_ai_text:
        # .strip() removes any extra spaces/newlines around the error message
        error_message = raw_ai_text.strip()
        return {"success": False, "error": error_message}

    # --- STEP 5: CLEAN THE AI TEXT (Markdown Removal) ---    
    # Remove whitespace from start/end
    clean_text = raw_ai_text.strip()
    

    # --- STEP 6: CONVERT STRING TO JSON OBJECT ---
    # json.loads (Load String) turns the text into a Python Dictionary (Object).
    try:
        final_json_object = json.loads(clean_text)
        return {"success": True, "data": final_json_object}
    except json.JSONDecodeError:
        # If the AI breaks the JSON structure, we return a failure
        return {
            "success": False, 
            "error": "AI failed to create a valid JSON structure",
            "debug": clean_text # Show start of text to see what went wrong
        }