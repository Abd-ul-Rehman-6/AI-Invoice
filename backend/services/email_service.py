# backend/services/email_service.py
from flask_mail import Message
from extensions import mail
from flask import current_app

def send_contact_confirmation(contact):
    """Send confirmation email to user"""
    try:
        msg = Message(
            subject=f"Thank you for contacting InvoiceGuard - {contact.subject}",
            recipients=[contact.email],
            html=f"""
            <h2>Thank you for reaching out, {contact.name}!</h2>
            <p>We have received your message and will get back to you within 24 hours.</p>
            
            <h3>Your Message:</h3>
            <p><strong>Subject:</strong> {contact.subject}</p>
            <p><strong>Message:</strong> {contact.message}</p>
            
            <hr>
            <p>Best regards,<br>InvoiceGuard Team</p>
            """
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        return False

def send_contact_notification(contact):
    """Send notification to admin"""
    try:
        msg = Message(
            subject=f"New Contact Form Submission - {contact.subject}",
            recipients=[current_app.config['MAIL_USERNAME']],
            html=f"""
            <h2>New Contact Form Submission</h2>
            
            <p><strong>Name:</strong> {contact.name}</p>
            <p><strong>Email:</strong> {contact.email}</p>
            <p><strong>Subject:</strong> {contact.subject}</p>
            <p><strong>Message:</strong> {contact.message}</p>
            
            <hr>
            <p>View all submissions at: http://localhost:5000/admin/contacts</p>
            """
        )
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Admin notification failed: {str(e)}")
        return False