import os
import jwt
from functools import wraps
from datetime import datetime, timedelta, timezone
from flask import request, jsonify, g

from models import User

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7


def generate_token(user: User) -> str:
    payload = {
        "user_id": user.id,
        "role": user.role,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str):
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


def _extract_token():
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header.split(" ", 1)[1].strip()
    return None


def token_required(f):
    """Requires a valid Authorization: Bearer <token> header. Sets g.current_user."""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = _extract_token()
        if not token:
            return jsonify({"errorMsg": "Authentication token is missing"}), 401
        try:
            payload = decode_token(token)
        except jwt.ExpiredSignatureError:
            return jsonify({"errorMsg": "Session expired, please log in again"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"errorMsg": "Invalid authentication token"}), 401

        user = User.query.get(payload.get("user_id"))
        if not user:
            return jsonify({"errorMsg": "User no longer exists"}), 401

        g.current_user = user
        return f(*args, **kwargs)

    return decorated


def role_required(*roles):
    """Stack under @token_required. Restricts access to the given role(s)."""

    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not getattr(g, "current_user", None) or g.current_user.role not in roles:
                return jsonify({"errorMsg": "You are not authorized to access this resource"}), 403
            return f(*args, **kwargs)

        return decorated

    return decorator
