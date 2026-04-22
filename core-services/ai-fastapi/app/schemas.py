from pydantic import BaseModel
from typing import Dict, Any, Optional

# What Spring Boot sends TO FastAPI
class ShowcaseRequest(BaseModel):
    userContext: Dict[str, Any]

# What FastAPI sends BACK to Spring Boot
class ShowcaseResponse(BaseModel):
    status: str = "success"
    site_config: Dict[str, Any]