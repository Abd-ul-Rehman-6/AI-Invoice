# backend/utils/helpers.py
import os
import uuid
from datetime import datetime

def generate_unique_filename(filename):
    """Generate unique filename"""
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    return f"{uuid.uuid4().hex}_{int(datetime.utcnow().timestamp())}.{ext}"

def allowed_file(filename, allowed_extensions):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def format_datetime(dt, format='%Y-%m-%d %H:%M:%S'):
    """Format datetime"""
    if not dt:
        return None
    return dt.strftime(format)

def create_response(success=True, message=None, data=None, errors=None):
    """Create standardized API response"""
    response = {'success': success}
    if message:
        response['message'] = message
    if data is not None:
        response['data'] = data
    if errors:
        response['errors'] = errors
    return response