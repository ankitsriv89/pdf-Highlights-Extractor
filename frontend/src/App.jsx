
import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      await uploadFile(droppedFile);
    } else {
      setStatus('Please drop a PDF file.');
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      await uploadFile(selectedFile);
    } else {
      setStatus('Please select a PDF file.');
    }
  };

  const uploadFile = async (file) => {
    setStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('https://api.pdfbrightout.online/api/upload', {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'highlights.docx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setStatus('File processed successfully! DOCX downloaded.');
      } else {
        const error = await response.json();
        setStatus(`Error: ${error.error}`);
      }
    } catch (error) {
      setStatus('Error uploading file.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">PDF Highlight Extractor</h1>
        <p className="text-center text-gray-700 mb-6">
          Upload your PDF and the app will extract the highlighted text into a DOC file.
        </p>
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-300 ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            <p className="text-gray-600">
              Drag and drop your PDF here or click to select a file
            </p>
          </label>
        </div>
        {file && <p className="mt-4 text-sm text-gray-600">Selected file: {file.name}</p>}
        {status && <p className="mt-4 text-sm text-center text-gray-700">{status}</p>}
      </div>
    </div>
  );
}

export default App;
