import re

def validate_email(email):
    """Validate email format"""
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

def validate_contact_form(data):
    """Validate contact form data"""
    errors = []
    
    # Check required fields
    required_fields = ['name', 'email', 'subject', 'message']
    for field in required_fields:
        if field not in data or not data[field].strip():
            errors.append(f"{field.capitalize()} is required")
    
    if errors:
        return False, errors
    
    # Validate email
    if not validate_email(data['email']):
        errors.append("Invalid email format")
    
    # Validate length
    if len(data['name']) > 100:
        errors.append("Name must be less than 100 characters")
    if len(data['subject']) > 200:
        errors.append("Subject must be less than 200 characters")
    if len(data['message']) > 5000:
        errors.append("Message must be less than 5000 characters")
    
    if errors:
        return False, errors
    
    return True, []

def sanitize_input(text):
    """Basic input sanitization"""
    if not text:
        return text
    # Remove any HTML tags
    import re
    text = re.sub(r'<[^>]*>', '', text)
    # Escape special characters
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    return text.strip()