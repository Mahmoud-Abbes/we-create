from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
import httpx
from app.generators import tests_generator, showcase_generator
# Import your models (assuming they are in app/schemas.py)
from app.schemas import ShowcaseRequest, ShowcaseResponse 

@asynccontextmanager
async def lifespan(app: FastAPI):
    async_client = httpx.AsyncClient()
    app.state.http_client = async_client
    yield
    await async_client.aclose()

app = FastAPI(lifespan=lifespan)

@app.get("/health")
async def health_check():
    return tests_generator.get_system_status()

# You can keep this for manual testing in browser
@app.get("/test-ai")
async def test_ai():
    response = await tests_generator.run_welcoming_test()
    return {"ai_response": response}

@app.post("/create-showcase", response_model=ShowcaseResponse)
async def handle_showcase_generation(payload: ShowcaseRequest):
    """
    - Payload is automatically validated against ShowcaseRequest.
    - If 'userContext' is missing, FastAPI returns 422 before this code even runs.
    """
    
    # 1. Directly use the validated Pydantic object
    user_data = payload.userContext

    # 2. Processing
    try:
        result = await showcase_generator.generate_showcase_data(user_data)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail={"message": f"Generation failed: {str(e)}"}
        )

    # 3. Success/Failure Handling
    if result.get("success") is False:
        raise HTTPException(
            status_code=422,
            detail={
                "message": result.get("error"),
                "debug": result.get("debug")
            }
        )
        
    # 4. Return using the Response Model
    # This ensures Spring Boot always gets exactly what it expects.
    return ShowcaseResponse(site_config=result.get("data"))