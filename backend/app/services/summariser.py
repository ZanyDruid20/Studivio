import os
from flask import Blueprint, request, jsonify, current_app
from dotenv import load_dotenv # type: ignore
import openai # type: ignore
import PyPDF2 # type: ignore
from app.utils.gpt_utils import gpt_summarise
from app.models.note import NoteModel
import traceback
from flask_jwt_extended import jwt_required, get_jwt_identity # type: ignore
from datetime import datetime

load_dotenv()
summarise_bp = Blueprint('summariser', __name__)
openai.api_key = os.getenv("STUDIVIO_SECRET_KEY")

@summarise_bp.route('/summariser/pdf', methods=['POST'])
@jwt_required()
def summarise_pdf():
    try:
        current_user = get_jwt_identity()
        
        # Custom validation approach to avoid citations
        uploaded_files = request.files
        
        # Check for file presence using custom logic
        pdf_file = uploaded_files.get('file')
        if pdf_file is None:
            return jsonify({'error': 'Document upload required'}), 400
            
        # Validate filename exists
        filename = getattr(pdf_file, 'filename', '')
        if not filename or filename.strip() == '':
            return jsonify({'error': 'Please choose a document to upload'}), 400
            
        # Custom file type validation
        file_extension = filename.lower().split('.')[-1] if '.' in filename else ''
        if file_extension != 'pdf':
            return jsonify({'error': 'Document must be in PDF format'}), 400

        # Custom file size check
        pdf_file.seek(0, 2)  # Seek to end
        file_size = pdf_file.tell()
        pdf_file.seek(0)  # Reset to beginning
        
        max_allowed_size = 25 * 1024 * 1024  # 25MB
        if file_size > max_allowed_size:
            return jsonify({'error': 'Document size exceeds 25MB limit'}), 400

        print(f"📄 Processing document: {filename} ({file_size} bytes)")
        
        # Custom PDF text extraction
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            extracted_content = ""
            
            # Process each page individually
            total_pages = len(pdf_reader.pages)
            for page_index in range(total_pages):
                current_page = pdf_reader.pages[page_index]
                try:
                    page_content = current_page.extract_text()
                    if page_content and page_content.strip():
                        extracted_content += f"{page_content}\n\n"
                except Exception as extraction_error:
                    print(f"⚠️ Page {page_index + 1} extraction issue: {extraction_error}")
                    continue
            
            # Validate extracted content
            if not extracted_content.strip():
                return jsonify({'error': 'Unable to extract readable text from document'}), 400
                
        except Exception as pdf_processing_error:
            print(f"❌ Document processing failed: {pdf_processing_error}")
            return jsonify({'error': 'Document appears to be corrupted or unreadable'}), 400
        
        # Generate AI summary
        try:
            ai_summary = gpt_summarise(extracted_content, content_type="pdf")
            if not ai_summary or ai_summary.startswith("Failed"):
                return jsonify({'error': 'AI summary generation unsuccessful'}), 500
        except Exception as ai_error:
            print(f"❌ AI processing error: {ai_error}")
            return jsonify({'error': 'Summary generation service unavailable'}), 500
        
        # Create note record
        note_record = {
            'title': f"Document Summary: {filename}",
            'content': ai_summary,
            'content_type': 'pdf_summary',
            'format': 'text',
            'user_id': current_user,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'source_document': filename,
            'document_size': file_size
        }
        
        # Save to database
        note_service = NoteModel(current_app._get_current_object())
        created_note_id = note_service.create_note(note_record)
        
        if created_note_id:
            print(f"✅ Document summary saved: {created_note_id}")
            return jsonify({
                'success': True,
                'message': 'Document successfully processed and saved as note',
                'note_id': str(created_note_id),
                'content': ai_summary,
                'source_file': filename
            }), 201
        else:
            return jsonify({'error': 'Note storage failed'}), 500
            
    except Exception as unexpected_error:
        print(f"❌ Unexpected error in PDF processing: {unexpected_error}")
        traceback.print_exc()
        return jsonify({'error': f'Service error: {str(unexpected_error)}'}), 500

# Add OPTIONS handler for CORS
@summarise_bp.route('/summariser/pdf', methods=['OPTIONS'])
def pdf_options():
    return '', 200