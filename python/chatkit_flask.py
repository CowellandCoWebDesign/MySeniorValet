"""
Simple Flask ChatKit Session Service
"""

import os
import json
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# In-memory session storage
sessions = {}

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "chatkit-flask-service"})

@app.route("/api/chatkit/session", methods=["POST"])
def create_session():
    """Create a new ChatKit session"""
    try:
        data = request.json or {}
        thread_id = data.get("thread_id")
        user_id = data.get("user_id")
        assistant_id = data.get("assistant_id") or os.getenv("ASSISTANT_ID", "asst_FnXClWdC8GsX5jzOLrYAh5UE")
        
        logger.info(f"Creating session for assistant: {assistant_id}")
        
        # Create or retrieve thread
        if thread_id:
            try:
                thread = openai_client.beta.threads.retrieve(thread_id)
            except:
                thread = openai_client.beta.threads.create()
        else:
            thread = openai_client.beta.threads.create()
        
        # Generate demo token (since ChatKit API isn't available in Python SDK yet)
        import secrets
        client_secret = f"ck_demo_{secrets.token_hex(32)}"
        expires_at = datetime.now() + timedelta(hours=1)
        
        # Store session
        sessions[client_secret] = {
            "thread_id": thread.id,
            "assistant_id": assistant_id,
            "expires_at": expires_at,
            "user_id": user_id
        }
        
        return jsonify({
            "client_secret": client_secret,
            "thread_id": thread.id,
            "assistant_id": assistant_id,
            "expires_at": expires_at.isoformat(),
            "metadata": {
                "session_type": "assistant",
                "capabilities": ["search_communities", "enable_discovery_mode", "show_on_map"]
            }
        })
        
    except Exception as e:
        logger.error(f"Error creating session: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/chatkit/refresh", methods=["POST"])
def refresh_session():
    """Refresh an existing session"""
    try:
        data = request.json or {}
        client_secret = data.get("client_secret")
        
        if not client_secret or client_secret not in sessions:
            return jsonify({"error": "Invalid session"}), 401
        
        session = sessions[client_secret]
        
        # Generate new token
        import secrets
        new_secret = f"ck_demo_{secrets.token_hex(32)}"
        new_expires = datetime.now() + timedelta(hours=1)
        
        # Update session
        sessions[new_secret] = {
            **session,
            "expires_at": new_expires
        }
        del sessions[client_secret]
        
        return jsonify({
            "client_secret": new_secret,
            "thread_id": session["thread_id"],
            "assistant_id": session["assistant_id"],
            "expires_at": new_expires.isoformat(),
            "metadata": {"refreshed": True}
        })
        
    except Exception as e:
        logger.error(f"Error refreshing session: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("CHATKIT_SERVICE_PORT", "8001"))
    logger.info(f"Starting ChatKit Flask service on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)