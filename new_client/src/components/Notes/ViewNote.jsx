import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function ViewNote() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [note, setNote] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadNote = async () => {
            try {
                setIsLoading(true);
                const authToken = localStorage.getItem('token');
                
                if (!authToken) {
                    setError('Please log in to view notes');
                    navigate('/login');
                    return;
                }

                const response = await fetch(`http://127.0.0.1:5000/notes/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const noteData = await response.json();
                    setNote(noteData);
                    setError('');
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Failed to load note');
                }
            } catch (error) {
                setError('Connection error. Please check if backend is running.');
                console.error('Error loading note:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadNote();
    }, [id, navigate]);

    const getTypeInfo = (contentType) => {
        const types = {
            'pdf_summary': { icon: '📄', label: 'PDF Summary', color: 'bg-red-50 text-red-700 border-red-200' },
            'voice_transcription': { icon: '🎙️', label: 'Voice Note', color: 'bg-green-50 text-green-700 border-green-200' },
            'manual': { icon: '✏️', label: 'Manual Note', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            'youtube_summary': { icon: '📺', label: 'YouTube Summary', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            'default': { icon: '📝', label: 'Note', color: 'bg-gray-50 text-gray-700 border-gray-200' }
        };
        return types[contentType] || types.default;
    };

    if (isLoading) {
        return (
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8 ml-60">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="animate-spin text-4xl mb-4">⏳</div>
                        <div className="text-lg text-gray-600">Loading note...</div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8 ml-60">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-red-100 border border-red-300 text-red-700 p-6 rounded-lg">
                            <h2 className="text-lg font-semibold mb-2">Error Loading Note</h2>
                            <p>{error}</p>
                            <button
                                onClick={() => navigate('/notes')}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Back to Notes
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    const typeInfo = getTypeInfo(note?.content_type);

    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 p-8 ml-60">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => navigate('/notes')}
                            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center space-x-2 transition-colors"
                        >
                            <span>←</span>
                            <span>Back to Notes</span>
                        </button>
                        
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium mb-4 ${typeInfo.color}`}>
                            <span>{typeInfo.icon}</span>
                            <span>{typeInfo.label}</span>
                        </div>
                        
                        <h1 className="text-3xl font-bold text-gray-800">
                            {note?.title}
                        </h1>
                    </div>

                    {/* Note Metadata */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Note Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium text-gray-600">Created:</span>
                                    <div className="text-gray-800">{new Date(note?.created_at).toLocaleString()}</div>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-600">Last Updated:</span>
                                    <div className="text-gray-800">{new Date(note?.updated_at).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {note?.source_document && (
                                    <div>
                                        <span className="font-medium text-gray-600">Source Document:</span>
                                        <div className="text-gray-800">{note.source_document}</div>
                                    </div>
                                )}
                                {note?.source_audio && (
                                    <div>
                                        <span className="font-medium text-gray-600">Audio Source:</span>
                                        <div className="text-gray-800">{note.source_audio}</div>
                                    </div>
                                )}
                                {note?.audio_size && (
                                    <div>
                                        <span className="font-medium text-gray-600">Audio Size:</span>
                                        <div className="text-gray-800">{(note.audio_size / 1024 / 1024).toFixed(2)} MB</div>
                                    </div>
                                )}
                                {note?.content && (
                                    <div>
                                        <span className="font-medium text-gray-600">Content Length:</span>
                                        <div className="text-gray-800">{note.content.length} characters</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Note Content */}
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Content</h2>
                        <div className="prose max-w-none">
                            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
                                {note?.content || 'No content available'}
                            </div>
                        </div>
                    </div>

                    {/* Transcript Section (for voice notes) */}
                    {note?.transcript && (
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                🎙️ Original Transcript
                            </h2>
                            <div className="bg-gray-50 p-4 rounded-lg max-h-80 overflow-y-auto">
                                <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                                    {note.transcript}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => navigate(`/edit-note/${note?._id}`)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            ✏️ Edit Note
                        </button>
                        
                        <button
                            onClick={() => navigate('/notes')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            📝 All Notes
                        </button>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(note?.content || '');
                                alert('Content copied to clipboard!');
                            }}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            📋 Copy Content
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}