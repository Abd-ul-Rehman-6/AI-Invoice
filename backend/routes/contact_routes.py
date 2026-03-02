# backend/routes/contact_routes.py
from flask import Blueprint, request, jsonify
from extensions import db
from models.contact import Contact
from services.validation_service import validate_contact_form, sanitize_input
from services.email_service import send_contact_confirmation, send_contact_notification
from flask_jwt_extended import jwt_required, get_jwt_identity

contact_bp = Blueprint('contact', __name__, url_prefix='/api/contact')

@contact_bp.route('', methods=['POST'])
def submit_contact():
    """Submit contact form"""
    try:
        data = request.get_json()
        
        # Validate input
        is_valid, errors = validate_contact_form(data)
        if not is_valid:
            return jsonify({
                'success': False,
                'errors': errors
            }), 400
        
        # Sanitize input
        contact = Contact(
            name=sanitize_input(data['name']),
            email=sanitize_input(data['email'].lower()),
            subject=sanitize_input(data['subject']),
            message=sanitize_input(data['message']),
            status='unread'
        )
        
        # Save to database
        db.session.add(contact)
        db.session.commit()
        
        # Send emails (don't wait for response)
        try:
            send_contact_confirmation(contact)
            send_contact_notification(contact)
        except Exception as e:
            print(f"Email sending failed: {str(e)}")
            # Don't fail the request if emails don't send
        
        return jsonify({
            'success': True,
            'message': 'Your message has been sent successfully!',
            'data': contact.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Contact form error: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to send message. Please try again.'
        }), 500

@contact_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_contacts():
    """Get all contacts (admin only)"""
    try:
        # Check if user is admin (you need to implement this)
        current_user_id = get_jwt_identity()
        
        contacts = Contact.query.order_by(Contact.created_at.desc()).all()
        return jsonify({
            'success': True,
            'data': [contact.to_dict() for contact in contacts]
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@contact_bp.route('/<int:contact_id>', methods=['PUT'])
@jwt_required()
def update_contact(contact_id):
    """Update contact status"""
    try:
        contact = Contact.query.get_or_404(contact_id)
        data = request.get_json()
        
        if 'status' in data:
            contact.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Contact updated successfully',
            'data': contact.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@contact_bp.route('/<int:contact_id>', methods=['DELETE'])
@jwt_required()
def delete_contact(contact_id):
    """Delete contact"""
    try:
        contact = Contact.query.get_or_404(contact_id)
        db.session.delete(contact)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Contact deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500