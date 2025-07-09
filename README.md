PDF Highlight Extractor
A web application that extracts highlighted text from PDF files and exports it to a DOCX document. The frontend, built with Vite + React and styled with Tailwind CSS, features a vibrant, full-page, mobile-friendly interface with drag-and-drop PDF upload. The backend, developed with Flask and deployed on Google Cloud Run, processes PDFs using PyMuPDF and generates DOCX files with python-docx. Hosted on Google Cloud Storage and Cloud Run, it supports seamless CORS integration for production and local development. Ideal for students, researchers, or anyone needing to extract annotated text from PDFs efficiently.
Features

Drag-and-drop PDF upload with animated, responsive UI
Highlight extraction with PyMuPDF
DOCX export with formatted bullet points
Colorful, full-page design with Tailwind CSS
Mobile-friendly layout
Deployed on Google Cloud (Storage + Run)

Tech Stack

Frontend: React, Vite, Tailwind CSS
Backend: Flask, PyMuPDF, python-docx
Infrastructure: Google Cloud Storage, Google Cloud Run
