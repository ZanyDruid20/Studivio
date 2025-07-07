import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function VoiceNote() {
    // Audio file states
    const [selectedAudioFile, setSelectedAudioFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedBlob, setRecordedBlob] = useState(null);
    
    // Processing states
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    
    // Results and feedback
    const [summary, setSummary] = useState('');
    const [message, setMessage] = useState('');
    
    const navigate = useNavigate();

    // Audio file selection handler
    const handleAudioFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            validateAndSetAudioFile(file);
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
            validateAndSetAudioFile(files[0]);
        }
    };

    // Audio file validation - matches backend expectations
    const validateAndSetAudioFile = (uploadedFile) => {
        const allowedTypes = [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/mp4',
            'audio/m4a',
            'audio/webm'
        ];
        
        // Match backend validation: 50MB limit
        const maxSizeBytes = 50 * 1024 * 1024;
        
        if (!allowedTypes.includes(uploadedFile.type) && 
            !allowedTypes.some(type => uploadedFile.name.toLowerCase().endsWith(type.split('/')[1]))) {
            setMessage('⚠️ Only audio files (MP3, WAV, M4A, MP4, WebM) are supported');
            return;
        }
        
        if (uploadedFile.size > maxSizeBytes) {
            const sizeMB = (uploadedFile.size / 1024 / 1024).toFixed(1);
            setMessage(`⚠️ Audio file too large (${sizeMB}MB). Maximum size is 50MB`);
            return;
        }
        
        setSelectedAudioFile(uploadedFile);
        setRecordedBlob(null);
        setMessage('✅ Audio file ready for processing');
    };

    // Start recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setRecordedBlob(blob);
                setSelectedAudioFile(null);
                setMessage('✅ Recording ready for processing');
                
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
            setMessage('🎙️ Recording in progress...');
        } catch (error) {
            setMessage('❌ Microphone access denied. Please allow microphone permissions.');
            console.error('Recording error:', error);
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
            setMediaRecorder(null);
        }
    };

    // Process audio - matches backend expectations
    const handleAudioSubmit = async () => {
        let audioFile = selectedAudioFile;
        
        // Convert recorded blob to file
        if (recordedBlob) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            audioFile = new File([recordedBlob], `recording-${timestamp}.webm`, { 
                type: 'audio/webm' 
            });
        }
        
        if (!audioFile) {
            setMessage('Please upload an audio file or record one first');
            return;
        }
        
        setIsProcessing(true);
        setMessage('');
        
        try {
            const authToken = localStorage.getItem('token');
            setProcessingMessage('Transcribing audio and generating summary...');
            
            const formData = new FormData();
            formData.append('file', audioFile);
            
            console.log('Sending to backend:', audioFile.name, audioFile.size, audioFile.type);
            
            const response = await fetch('http://127.0.0.1:5000/whisper/audio', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: formData
            });
            
            console.log('Backend response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Backend response data:', data);
                
                setSummary(data.content);
                setMessage('✅ Audio processed successfully! Summary saved as a note.');
                
                setTimeout(() => {
                    navigate('/notes');
                }, 3000);
            } else {
                const error = await response.json();
                console.error('Backend error:', error);
                setMessage(`⚠️ ${error.error || 'Audio processing failed'}`);
            }
        } catch (error) {
            console.error('Network error:', error);
            setMessage('❌ Connection error. Please verify backend is running.');
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
                    <h1 className="text-2xl font-bold mb-6 text-center">AI Voice Transcriber</h1>

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

                    {/* Voice Recording Section */}
                    <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold mb-4">🎙️ Record Voice Note</h2>
                        
                        <div className="flex items-center space-x-4">
                            {!isRecording ? (
                                <button
                                    onClick={startRecording}
                                    disabled={isProcessing}
                                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    🎙️ Start Recording
                                </button>
                            ) : (
                                <button
                                    onClick={stopRecording}
                                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors animate-pulse"
                                >
                                    ⏹️ Stop Recording
                                </button>
                            )}
                            
                            {recordedBlob && (
                                <div className="flex items-center space-x-2">
                                    <div className="text-green-600">✅ Recording ready</div>
                                    <button
                                        onClick={() => {
                                            setRecordedBlob(null);
                                            setMessage('');
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Audio File Upload Section */}
                    <div 
                        className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 transition-colors"
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            accept="audio/*,.mp3,.wav,.m4a,.mp4,.webm"
                            onChange={handleAudioFileSelect}
                            className="hidden"
                            id="audio-upload"
                        />
                        
                        <div className="space-y-4">
                            <div className="text-6xl">🎵</div>
                            <div className="text-lg font-medium text-gray-700">
                                Choose an audio file or drag & drop it here
                            </div>
                            <div className="text-sm text-gray-500">
                                MP3, WAV, M4A, MP4, WebM formats, up to 50MB
                            </div>
                            
                            <label
                                htmlFor="audio-upload"
                                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                            >
                                Browse Files
                            </label>
                        </div>
                        
                        {selectedAudioFile && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-2xl">🎵</div>
                                        <div>
                                            <div className="font-medium">{selectedAudioFile.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {(selectedAudioFile.size / 1024 / 1024).toFixed(2)} MB
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedAudioFile(null)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Process Button */}
                    {(selectedAudioFile || recordedBlob) && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={handleAudioSubmit}
                                disabled={isProcessing}
                                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isProcessing ? '⏳ Processing...' : '🚀 Transcribe & Summarize'}
                            </button>
                        </div>
                    )}

                    {/* Summary Results Display */}
                    {summary && (
                        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Generated Summary</h3>
                                <div className="text-sm text-gray-500">AI-powered audio content summary</div>
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
                                        setSelectedAudioFile(null);
                                        setRecordedBlob(null);
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