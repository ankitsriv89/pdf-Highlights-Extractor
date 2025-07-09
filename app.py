from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import fitz  # PyMuPDF
from docx import Document
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)


# Allow specific GCS origin and localhost for development
CORS(app, resources={r"/api/*": {"origins": [
    "https://storage.googleapis.com/pdf-highlight-frontend",
    "https://storage.googleapis.com"
    #"http://localhost:5173"
],
"methods": ["GET", "POST", "OPTIONS"],
"allow_headers": ["Content-Type"]
}})

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_EXTENSIONS = {'pdf'}

# Ensure directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_highlighted_text(pdf_path):
    highlights = []
    try:
        doc = fitz.open(pdf_path)
        for page_num, page in enumerate(doc, 1):
            for annot in page.annots():
                if annot.type[0] == 8:  # Highlight annotation
                    rect = annot.rect
                    text = page.get_text("text", clip=rect)
                    if text:
                        highlights.append(text.strip())
        doc.close()
    except Exception as e:
        print(f"Error processing PDF: {e}")
    return highlights

def save_to_docx(highlights, output_path):
    doc = Document()
    doc.add_heading('Highlighted Text', 0)
    if not highlights:
        doc.add_paragraph('No highlighted text found in the PDF.')
    else:
        for highlight in highlights:
            doc.add_paragraph(highlight, style='List Bullet')
    doc.save(output_path)

@app.route('/')
def home():
    return jsonify({'message': 'Welcome to PDF Highlight Extractor API. Use /api/upload to upload a PDF.'}), 200

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        pdf_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(pdf_path)
        
        highlights = extract_highlighted_text(pdf_path)
        
        output_filename = f"highlights_{filename.rsplit('.', 1)[0]}.docx"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        save_to_docx(highlights, output_path)
        
        os.remove(pdf_path)
        
        return send_file(output_path, as_attachment=True, download_name=output_filename)
    else:
        return jsonify({'error': 'Invalid file type. Please upload a PDF.'}), 400

@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request. Please check your request and try again.'}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found. Use /api/upload for PDF uploads.'}), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))  # Use PORT env var or default to 8080
    app.run(host='0.0.0.0', port=port, debug=True)