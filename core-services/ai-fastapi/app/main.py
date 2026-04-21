from fastapi import FastAPI, Body, HTTPException
from contextlib import asynccontextmanager
import httpx
from app.generators import tests_generator
from app.generators import showcase_generator

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events.
    This ensures we use a single connection pool for the entire app.
    """
    # Create a shared async client for any internal/external HTTP calls
    async_client = httpx.AsyncClient()
    app.state.http_client = async_client
    
    yield  # The app runs here
    
    # Cleanup when the app stops
    await async_client.aclose()

app = FastAPI(lifespan=lifespan)

@app.get("/health")
async def health_check():
    """Test API connectivity"""
    # If this logic is simple, keeping it as is is fine.
    return tests_generator.get_system_status()

@app.get("/test-ai")
async def test_ai():
    """Test LLM connectivity"""
    response = await tests_generator.run_welcoming_test()
    return {"ai_response": response}

@app.post("/create-showcase")
async def handle_showcase_generation(payload: dict = Body(...)):
    """
    The main entry point for the Spring Boot 'Brain'.
    Receives 'userContext' and returns the generated site configuration.
    """
    
    # 1. Extraction
    user_data = payload.get("userContext")
    if not user_data:
        raise HTTPException(
            status_code=400, 
            detail="Invalid input: Payload must contain a 'userContext' object."
        )

    # 2. Processing (Ensure generate_showcase_data is 'async def')
    try:
        result = await showcase_generator.generate_showcase_data(user_data)
    except Exception as e:
        # Catch unexpected AI or logic crashes
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")
    
    # 3. Success/Failure Handling
    # Using actual HTTP status codes helps the Spring Boot WebClient react properly
    if result.get("success") is False:
        raise HTTPException(
            status_code=422, # Unprocessable Entity: Request was okay, but AI logic failed
            detail={
                "message": result.get("error"),
                "debug": result.get("debug")
            }
        )
        
    # 4. Return the production-ready site config
    return {
        "status": "success",
        "site_config": result.get("data")
    }