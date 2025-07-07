import os
from flask import Blueprint, request, jsonify, current_app
from dotenv import load_dotenv # type: ignore
import openai # type: ignore
import assemblyai as aai # type: ignore
from app.models.note import NoteModel
from app.utils.gpt_utils import gpt_summarise
from flask_jwt_extended import jwt_required, get_jwt_identity # type: ignore
from datetime import datetime
import traceback

load_dotenv()
whisperer_bp = Blueprint('whisper', __name__)
ASSEMBLY_API_KEY = os.getenv("ASSEMBLY_API_KEY")
aai.settings.api_key = ASSEMBLY_API_KEY
openai.api_key = os.getenv("STUDIVIO_SECRET_KEY")

@whisperer_bp.route('/whisper/audio', methods=['POST'])  # Fixed route
@jwt_required()
def whisper():
    try:
        current_user = get_jwt_identity()  # Added missing import
        print("FILES RECEIVED:", request.files)
        print("FORM RECEIVED:", request.form)
        
        # File validation
        uploaded_files = request.files
        audio_file = uploaded_files.get('file')
        
        if audio_file is None:
            return jsonify({'error': 'Audio file upload required'}), 400
            
        filename = getattr(audio_file, 'filename', '')
        if not filename or filename.strip() == '':
            return jsonify({'error': 'Please choose an audio file to upload'}), 400
            
        # Audio file type validation
        allowed_extensions = ['mp3', 'wav', 'm4a', 'mp4', 'webm']
        file_extension = filename.lower().split('.')[-1] if '.' in filename else ''

        if file_extension not in allowed_extensions:
            return jsonify({'error': f'Audio format not supported. Use: {", ".join(allowed_extensions)}'}), 400
            
        # File size validation
        audio_file.seek(0, 2)
        file_size = audio_file.tell()
        audio_file.seek(0)
        max_size = 50 * 1024 * 1024 
        if file_size > max_size:
            return jsonify({'error': 'Audio file size exceeds 50MB limit'}), 400
            
        print(f"Processing audio: {filename} ({file_size} bytes)")

        # Save file temporarily
        temp_dir = os.path.join(os.getcwd(), "audio")
        os.makedirs(temp_dir, exist_ok=True)
        temp_path = os.path.join(temp_dir, filename)
        print("Saving file...")
        audio_file.save(temp_path)
        print("File saved, starting transcription...")

        # Transcription
        try:
            transcriber = aai.Transcriber()
            transcript_result = transcriber.transcribe(temp_path)
            if transcript_result.status == aai.TranscriptStatus.error:
                return jsonify({'error': 'Audio transcription failed'}), 500
            transcript = transcript_result.text
            if not transcript or len(transcript.strip()) < 10:
                return jsonify({'error': 'No clear speech detected in audio'}), 400
        except Exception as transcription_error:
            print(f"Transcription error: {transcription_error}")
            return jsonify({'error': 'Audio transcription service unavailable'}), 500
            
        # Generate AI summary
        try:
            text_content = gpt_summarise(transcript, content_type="audio")
            if not text_content or text_content.startswith("Failed"):
                return jsonify({'error': 'AI summary generation unsuccessful'}), 500
        except Exception as error:
            print(f"AI processing error: {error}")
            return jsonify({'error': 'Summary generation service unavailable'}), 500

        # Create note record (fixed variable name)
        note_data = {
            'title': f"Voice Note: {filename}",
            'content': text_content,  # Fixed variable name
            'content_type': 'voice_transcription',
            'format': 'text',
            'user_id': current_user,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'source_audio': filename,
            'audio_size': file_size,
            'transcript': transcript
        }
        
        # Save to database (fixed variable name)
        note_service = NoteModel(current_app._get_current_object())
        created_note_id = note_service.create_note(note_data)  # Fixed: was note_record

        # Clean up temp file
        try:
            os.remove(temp_path)
        except:
            pass 
            
        if created_note_id:
            print(f"✅ Voice note saved: {created_note_id}")
            return jsonify({
                'success': True,
                'message': 'Audio successfully processed and saved as note',
                'note_id': str(created_note_id),
                'content': text_content,  # Fixed: was ai_summary
                'source_file': filename
            }), 201
        else:
            return jsonify({'error': 'Note storage failed'}), 500
            
    except Exception as unexpected_error:
        print(f"Unexpected error in audio processing: {unexpected_error}")
        traceback.print_exc()
        return jsonify({'error': f'Service error: {str(unexpected_error)}'}), 500

@whisperer_bp.route('/whisper/audio', methods=['OPTIONS'])
def audio_options():
    return '', 200




