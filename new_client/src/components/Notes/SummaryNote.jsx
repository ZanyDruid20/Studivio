import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function SummaryNote() {
    // Upload states for PDF's
    const [selectedFile, setSelectedFile] = useState(null);
    // Processing States
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    // Results and feedback
    const [summary, setSummary] = useState('');
    const [message, setMessage] = useState('');
    
    const navigate = useNavigate();

    // File selection handler
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    // Drag and drop handlers
    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            validateAndSetFile(files[0]);
        }
    };

    // File validation function
    const validateAndSetFile = (uploadedFile) => {
        const allowedType = 'application/pdf';
        const maxSizeBytes = 25 * 1024 * 1024; // 25MB
        
        if (uploadedFile.type !== allowedType) {
            setMessage('⚠️ Only PDF documents are supported');
            return;
        }
        
        if (uploadedFile.size > maxSizeBytes) {
            const sizeMB = (uploadedFile.size / 1024 / 1024).toFixed(1);
            setMessage(`⚠️ Document too large (${sizeMB}MB). Maximum size is 25MB`);
            return;
        }
        
        setSelectedFile(uploadedFile);
        setMessage('✅ Document ready for processing');
    };

    // PDF processing handler
    const handlePDFSubmit = async () => {
        if (!selectedFile) {
            setMessage('Please choose a PDF document first');
            return;
        }
        
        setIsProcessing(true);
        setMessage('');
        
        try {
            const authToken = localStorage.getItem('token');
            setProcessingMessage('Processing document and creating summary...');
            
            const documentForm = new FormData();
            documentForm.append('file', selectedFile);
            
            const apiResponse = await fetch('http://127.0.0.1:5000/summariser/pdf', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: documentForm
            });
            
            if (apiResponse.ok) {
                const responseData = await apiResponse.json();
                setSummary(responseData.content);
                setMessage(' Summary generated successfully! Saved as a note.');
                
                setTimeout(() => {
                    navigate('/notes');
                }, 3000);
            } else {
                const errorResponse = await apiResponse.json();
                setMessage(`⚠️ ${errorResponse.error || 'Processing failed'}`);
            }
        } catch (processingError) {
            setMessage(' Connection error. Please verify backend is running.');
            console.error('Processing error:', processingError);
        } finally {
            setIsProcessing(false);
            setProcessingMessage('');
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 p-8 ml-60">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6 text-center">AI PDF Summarizer</h1>

                    {/* Message Display */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${
                            message.includes('successfully') || message.includes('✅')
                                ? 'bg-green-100 border border-green-300 text-green-700' 
                                : message.includes('Error') || message.includes('Failed') || message.includes('⚠️')
                                ? 'bg-red-100 border border-red-300 text-red-700'
                                : 'bg-blue-100 border border-blue-300 text-blue-700'
                        }`}>
                            {message}
                        </div>
                    )}

                    {/* Processing State Display */}
                    {isProcessing && (
                        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin text-xl">⏳</div>
                                <div>
                                    <div className="font-medium">Processing...</div>
                                    <div className="text-sm">{processingMessage}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PDF Upload Section */}
                    <div 
                        className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 transition-colors"
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="pdf-upload"
                        />
                        
                        <div className="space-y-4">
                            <div className="text-6xl">📄</div>
                            <div className="text-lg font-medium text-gray-700">
                                Choose a PDF or drag & drop it here
                            </div>
                            <div className="text-sm text-gray-500">
                                PDF format, up to 25MB
                            </div>
                            
                            <label
                                htmlFor="pdf-upload"
                                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                            >
                                Browse Files
                            </label>
                        </div>
                        
                        {selectedFile && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-2xl">📄</div>
                                        <div>
                                            <div className="font-medium">{selectedFile.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}

                        {selectedFile && (
                            <div className="mt-6">
                                <button
                                    onClick={handlePDFSubmit}
                                    disabled={isProcessing}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isProcessing ? '⏳ Processing...' : '🚀 Generate Summary'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Summary Results Display */}
                    {summary && (
                        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Generated Summary</h3>
                                <div className="text-sm text-gray-500">AI-powered content summary</div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                                <div className="whitespace-pre-wrap text-gray-700">
                                    {typeof summary === 'object' ? JSON.stringify(summary, null, 2) : summary}
                                </div>
                            </div>
                            
                            <div className="mt-4 flex space-x-3">
                                <button
                                    onClick={() => navigate('/notes')}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    📝 View All Notes
                                </button>
                                <button
                                    onClick={() => {
                                        setSummary('');
                                        setSelectedFile(null);
                                        setMessage('');
                                    }}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    🔄 Create Another
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}