import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function EditNote() {
    const { id } = useParams(); // Get note ID from URL
    const navigate = useNavigate();
    
    // Note states
    const [note, setNote] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Load note data when component mounts
    useEffect(() => {
        const loadNote = async () => {
            try {
                setIsLoading(true);
                const authToken = localStorage.getItem('token');
                
                if (!authToken) {
                    setError('Please log in to edit notes');
                    navigate('/login');
                    return;
                }

                console.log('Loading note with ID:', id);
                
                const response = await fetch(`http://127.0.0.1:5000/notes/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const noteData = await response.json();
                    console.log('Note loaded:', noteData);
                    
                    setNote(noteData);
                    setTitle(noteData.title || '');
                    setContent(noteData.content || '');
                    setError('');
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || 'Failed to load note');
                    console.error('Failed to load note:', errorData);
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

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            setMessage('Title and content cannot be empty');
            return;
        }

        try {
            setIsSaving(true);
            const authToken = localStorage.getItem('token');

            const updateData = {
                title: title.trim(),
                content: content.trim(),
                updated_at: new Date().toISOString()
            };

            console.log('Saving note:', updateData);

            const response = await fetch(`http://127.0.0.1:5000/notes/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                setMessage('✅ Note saved successfully!');
                
                // Auto-redirect after 2 seconds
                setTimeout(() => {
                    navigate('/notes');
                }, 2000);
            } else {
                const errorData = await response.json();
                setMessage(`❌ ${errorData.error || 'Failed to save note'}`);
            }
        } catch (error) {
            setMessage('❌ Connection error. Please try again.');
            console.error('Error saving note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/notes');
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8 ml-60">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="animate-spin text-4xl mb-4">⏳</div>
                            <div className="text-lg text-gray-600">Loading note...</div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Error state
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

    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 p-8 ml-60">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Edit Note</h1>
                        <div className="text-sm text-gray-500 mt-1">
                            Note ID: {id} | Type: {note?.content_type || 'Unknown'}
                        </div>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${
                            message.includes('✅') 
                                ? 'bg-green-100 border border-green-300 text-green-700'
                                : 'bg-red-100 border border-red-300 text-red-700'
                        }`}>
                            {message}
                        </div>
                    )}

                    {/* Edit Form */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        {/* Title Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter note title..."
                            />
                        </div>

                        {/* Content Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={20}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                placeholder="Enter note content..."
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                Characters: {content.length}
                            </div>
                        </div>

                        {/* Original Note Info */}
                        {note && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Original Note Info</h3>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <div><strong>Created:</strong> {new Date(note.created_at).toLocaleString()}</div>
                                    <div><strong>Type:</strong> {note.content_type}</div>
                                    {note.source_file && <div><strong>Source:</strong> {note.source_file}</div>}
                                    {note.source_audio && <div><strong>Audio Source:</strong> {note.source_audio}</div>}
                                    {note.audio_size && <div><strong>Audio Size:</strong> {(note.audio_size / 1024 / 1024).toFixed(2)} MB</div>}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !title.trim() || !content.trim()}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSaving ? '💾 Saving...' : '💾 Save Changes'}
                            </button>
                            
                            <button
                                onClick={handleCancel}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={() => navigate('/notes')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                📝 Back to Notes
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}