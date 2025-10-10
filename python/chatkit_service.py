"""
ChatKit Session Management Microservice
Handles ChatKit session creation and management using the OpenAI Python SDK
"""

import os
import logging
from typing import Optional
from datetime import datetime, timedelta
import asyncio

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="ChatKit Session Service", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Request/Response models
class CreateSessionRequest(BaseModel):
    thread_id: Optional[str] = None
    user_id: Optional[str] = None
    assistant_id: Optional[str] = None

class SessionResponse(BaseModel):
    client_secret: str
    thread_id: str
    assistant_id: str
    expires_at: str
    metadata: dict

class RefreshSessionRequest(BaseModel):
    client_secret: str

class ValidateSessionRequest(BaseModel):
    client_secret: str

# In-memory session storage (in production, use Redis or database)
sessions = {}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "chatkit-session-service"}

@app.post("/api/chatkit/session", response_model=SessionResponse)
async def create_session(request: CreateSessionRequest):
    """
    Create a new ChatKit session using the OpenAI Python SDK
    """
    try:
        # Use provided assistant ID or default from environment
        assistant_id = request.assistant_id or os.getenv("ASSISTANT_ID", "asst_FnXClWdC8GsX5jzOLrYAh5UE")
        
        # Check if we have a workflow ID (for Agent Builder integration)
        workflow_id = os.getenv("CHATKIT_WORKFLOW_ID")
        
        if workflow_id:
            # Use ChatKit with Agent Builder workflow
            logger.info(f"Creating ChatKit session with workflow: {workflow_id}")
            
            # Create ChatKit session using the workflow
            session = openai_client.chatkit.sessions.create(
                workflow={"id": workflow_id},
                user=request.user_id if request.user_id else None,
                thread_id=request.thread_id if request.thread_id else None,
            )
            
            return SessionResponse(
                client_secret=session.client_secret,
                thread_id=session.thread_id,
                assistant_id=workflow_id,  # Use workflow ID as identifier
                expires_at=session.expires_at.isoformat() if hasattr(session, 'expires_at') else (datetime.now() + timedelta(hours=1)).isoformat(),
                metadata={
                    "session_type": "workflow",
                    "workflow_id": workflow_id,
                    "capabilities": ["agent_builder"]
                }
            )
        else:
            # Fallback: Use Assistant API with custom session management
            logger.info(f"Creating session for Assistant: {assistant_id}")
            
            # Create or retrieve thread
            if request.thread_id:
                try:
                    thread = openai_client.beta.threads.retrieve(request.thread_id)
                except:
                    thread = openai_client.beta.threads.create()
            else:
                thread = openai_client.beta.threads.create()
            
            # Generate a session token (for demo purposes, since Assistant API doesn't have ChatKit sessions)
            # In production, this would be the real ChatKit session
            import secrets
            client_secret = f"ck_demo_{secrets.token_hex(32)}"
            expires_at = datetime.now() + timedelta(hours=1)
            
            # Store session info
            sessions[client_secret] = {
                "thread_id": thread.id,
                "assistant_id": assistant_id,
                "expires_at": expires_at,
                "user_id": request.user_id
            }
            
            return SessionResponse(
                client_secret=client_secret,
                thread_id=thread.id,
                assistant_id=assistant_id,
                expires_at=expires_at.isoformat(),
                metadata={
                    "session_type": "assistant",
                    "capabilities": ["search_communities", "enable_discovery_mode", "show_on_map", "show_community_details", "compare_communities"]
                }
            )
            
    except AttributeError as e:
        # ChatKit API might not be available yet
        logger.warning(f"ChatKit API not available: {e}")
        
        # Fallback to Assistant API approach
        logger.info("Falling back to Assistant API session management")
        
        # Create or retrieve thread
        if request.thread_id:
            try:
                thread = openai_client.beta.threads.retrieve(request.thread_id)
            except:
                thread = openai_client.beta.threads.create()
        else:
            thread = openai_client.beta.threads.create()
        
        # Generate a demo session token
        import secrets
        client_secret = f"ck_demo_{secrets.token_hex(32)}"
        expires_at = datetime.now() + timedelta(hours=1)
        
        # Store session info
        sessions[client_secret] = {
            "thread_id": thread.id,
            "assistant_id": assistant_id or os.getenv("ASSISTANT_ID", "asst_FnXClWdC8GsX5jzOLrYAh5UE"),
            "expires_at": expires_at,
            "user_id": request.user_id
        }
        
        return SessionResponse(
            client_secret=client_secret,
            thread_id=thread.id,
            assistant_id=sessions[client_secret]["assistant_id"],
            expires_at=expires_at.isoformat(),
            metadata={
                "session_type": "assistant_fallback",
                "capabilities": ["search_communities", "enable_discovery_mode", "show_on_map", "show_community_details", "compare_communities"]
            }
        )
        
    except Exception as e:
        logger.error(f"Failed to create session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@app.post("/api/chatkit/refresh", response_model=SessionResponse)
async def refresh_session(request: RefreshSessionRequest):
    """
    Refresh an existing ChatKit session
    """
    try:
        # Check if it's a demo session
        if request.client_secret.startswith("ck_demo_"):
            session_info = sessions.get(request.client_secret)
            if not session_info:
                raise HTTPException(status_code=401, detail="Invalid or expired session")
            
            # Generate new token
            import secrets
            new_secret = f"ck_demo_{secrets.token_hex(32)}"
            new_expires = datetime.now() + timedelta(hours=1)
            
            # Update session
            sessions[new_secret] = {
                **session_info,
                "expires_at": new_expires
            }
            
            # Remove old session
            del sessions[request.client_secret]
            
            return SessionResponse(
                client_secret=new_secret,
                thread_id=session_info["thread_id"],
                assistant_id=session_info["assistant_id"],
                expires_at=new_expires.isoformat(),
                metadata={
                    "session_type": "assistant_fallback",
                    "refreshed": True
                }
            )
        else:
            # For real ChatKit sessions, would use the SDK refresh method
            raise HTTPException(status_code=501, detail="Real ChatKit refresh not implemented yet")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to refresh session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to refresh session: {str(e)}")

@app.post("/api/chatkit/validate")
async def validate_session(request: ValidateSessionRequest):
    """
    Validate a ChatKit session
    """
    try:
        # Check demo sessions
        if request.client_secret.startswith("ck_demo_"):
            session_info = sessions.get(request.client_secret)
            if not session_info:
                return {"valid": False, "error": "Session not found"}
            
            if session_info["expires_at"] < datetime.now():
                del sessions[request.client_secret]
                return {"valid": False, "error": "Session expired"}
            
            return {
                "valid": True,
                "thread_id": session_info["thread_id"],
                "assistant_id": session_info["assistant_id"],
                "expires_at": session_info["expires_at"].isoformat()
            }
        else:
            # For real ChatKit sessions, would validate with the API
            return {"valid": False, "error": "Real ChatKit validation not implemented yet"}
            
    except Exception as e:
        logger.error(f"Failed to validate session: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to validate session: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Initialize service on startup"""
    logger.info("ChatKit Session Service started")
    logger.info(f"OpenAI API Key configured: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")
    logger.info(f"Assistant ID: {os.getenv('ASSISTANT_ID', 'Using default')}")
    logger.info(f"Workflow ID: {os.getenv('CHATKIT_WORKFLOW_ID', 'Not configured')}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("ChatKit Session Service shutting down")

# For development: run with `python chatkit_service.py`
if __name__ == "__main__":
    port = int(os.getenv("CHATKIT_SERVICE_PORT", "8001"))
    uvicorn.run(
        "chatkit_service:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )