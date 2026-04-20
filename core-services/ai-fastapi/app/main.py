from fastapi import FastAPI, Body, HTTPException
from app.generators import tests_generator
from app.generators import showcase_generator

app = FastAPI()

@app.get("/health")
# Test api connectivity
async def health_check():
    return tests_generator.get_system_status()

@app.get("/test-ai")
# Test LLM connectivity
async def test_ai():
    response = await tests_generator.run_welcoming_test()
    return {"ai_response": response}

@app.post("/create-showcase")
async def handle_showcase_generation(payload: dict = Body(...)):
    """
    This endpoint receives the 'user-inputs-json-skeleton'.
    It extracts the data and returns the final site configuration.
    """
    
    # 1. Look for the 'userContext' block in the incoming JSON
    user_data = payload.get("userContext")
    
    # If the user sent a JSON without 'userContext', we stop here
    if not user_data:
        raise HTTPException(
            status_code=400, 
            detail="Invalid input: Payload must contain a 'userContext' object."
        )

    # 2. Pass the data to our generator
    result = await showcase_generator.generate_showcase_data(user_data)
    
    # 3. Handle Errors (like missing obligatory fields)
    if result["success"] is False:
        return {
            "status": "error",
            "message": result["error"],
            "debug": result["debug"]
        }
        
    # 4. Success: Return the production-ready site config
    return {
        "status": "success",
        "site_config": result["data"]
    }