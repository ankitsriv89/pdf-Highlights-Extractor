from flask import Flask, send_file, request
from flask_cors import CORS
import fitz  # PyMuPDF
from docx import Document
import os
import re
from io import BytesIO
from config import CORS_ORIGINS

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": CORS_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return {'error': 'No file provided'}, 400
    file = request.files['file']
    if not file.filename.endswith('.pdf'):
        return {'error': 'File must be a PDF'}, 400
    
    # Process PDF
    doc = fitz.open(stream=file.read(), filetype="pdf")
    highlights = []
    for page in doc:
        for annot in page.annots():
            if annot.type[0] == 8:  # Highlight
                rect = annot.rect
                text = page.get_text("text", clip=rect)
                if text.strip():
                    highlights.append(text.strip())
    
    # Create DOCX
    docx = Document()
    for highlight in highlights:
        docx.add_paragraph(highlight, style='List Bullet')
    
    output = BytesIO()
    docx.save(output)
    output.seek(0)
    
    return send_file(
        output,
        as_attachment=True,
        download_name='highlights.docx',
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
