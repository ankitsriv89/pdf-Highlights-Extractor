import { useState } from 'react';
   import './App.css';

   function App() {
     const [file, setFile] = useState(null);
     const [isDragging, setIsDragging] = useState(false);
     const [isUploading, setIsUploading] = useState(false);

     const handleFileChange = (event) => {
       setFile(event.target.files[0]);
     };

     const handleDragOver = (event) => {
       event.preventDefault();
       setIsDragging(true);
     };

     const handleDragEnter = (event) => {
       event.preventDefault();
       setIsDragging(true);
     };

     const handleDragLeave = (event) => {
       event.preventDefault();
       setIsDragging(false);
     };

     const handleDrop = (event) => {
       event.preventDefault();
       setIsDragging(false);
       const droppedFile = event.dataTransfer.files[0];
       if (droppedFile && droppedFile.type === 'application/pdf') {
         setFile(droppedFile);
       } else {
         alert('Please drop a valid PDF file.');
       }
     };

     const handleSubmit = async (event) => {
       event.preventDefault();
       if (!file) {
         alert('Please select or drop a PDF file');
         return;
       }

       setIsUploading(true);
       const formData = new FormData();
       formData.append('file', file);

       try {
         const response = await fetch('https://pdf-highlight-backend-917214708741.asia-south1.run.app/api/upload', {
           method: 'POST',
           body: formData,
         });

         if (!response.ok) {
           throw new Error('Network response was not ok');
         }

         const blob = await response.blob();
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = 'highlights.docx';
         document.body.appendChild(a);
         a.click();
         a.remove();
         window.URL.revokeObjectURL(url);
         setFile(null);
       } catch (error) {
         console.error('Error uploading file:', error);
         alert('Error uploading file');
       } finally {
         setIsUploading(false);
       }
     };

     return (
       <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col">
         {/* Header */}
         <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-md">
           <h1 className="text-3xl md:text-4xl font-extrabold text-center">PDF Highlight Extractor</h1>
           <p className="text-sm md:text-base text-center mt-2">Upload your PDF and extract highlighted text into a DOCX file</p>
         </header>

         {/* Main Content */}
         <main className="flex-grow flex items-center justify-center p-4">
           <form
             onSubmit={handleSubmit}
             className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6"
           >
             <div
               className={`border-4 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                 isDragging
                   ? 'border-indigo-500 bg-indigo-50 scale-105'
                   : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
               }`}
               onDragOver={handleDragOver}
               onDragEnter={handleDragEnter}
               onDragLeave={handleDragLeave}
               onDrop={handleDrop}
             >
               <svg
                 className="mx-auto h-12 w-12 text-indigo-500 mb-4"
                 fill="none"
                 stroke="currentColor"
                 viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg"
               >
                 <path
                   strokeLinecap="round"
                   strokeLinejoin="round"
                   strokeWidth="2"
                   d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                 />
               </svg>
               <p className="text-gray-700 text-lg">
                 {file ? (
                   <span className="font-semibold">Selected: {file.name}</span>
                 ) : (
                   'Drag and drop a PDF here or click to select'
                 )}
               </p>
               <input
                 type="file"
                 accept=".pdf"
                 onChange={handleFileChange}
                 className="hidden"
                 id="fileInput"
               />
               <label
                 htmlFor="fileInput"
                 className="mt-4 inline-block px-6 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 cursor-pointer transition-colors duration-200"
               >
                 Select File
               </label>
             </div>
             <button
               type="submit"
               className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full hover:from-green-600 hover:to-teal-600 disabled:bg-gray-400 transition-all duration-200 flex items-center justify-center"
               disabled={!file || isUploading}
             >
               {isUploading ? (
                 <svg
                   className="animate-spin h-5 w-5 mr-2 text-white"
                   viewBox="0 0 24 24"
                   fill="none"
                   xmlns="http://www.w3.org/2000/svg"
                 >
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                   <path
                     className="opacity-75"
                     fill="currentColor"
                     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                   />
                 </svg>
               ) : null}
               {isUploading ? 'Uploading...' : 'Upload and Extract'}
             </button>
           </form>
         </main>

         {/* Footer */}
         <footer className="bg-gray-800 text-white p-4 text-center">
           <p className="text-sm">Built with ❤️ using React, Tailwind CSS, and Flask</p>
           <p className="text-xs mt-1">Deployed on Google Cloud</p>
         </footer>
       </div>
     );
   }

   export default App;