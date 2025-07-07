import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function CreateNote() {
    // State management
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    const navigate = useNavigate();

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!title.trim()) {
            setMessage('Please enter a note title');
            return;
        }
        
        if (!content.trim()) {
            setMessage('Please add some content to your note');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setMessage('Authentication required. Please log in again.');
                navigate('/login');
                return;
            }

            const noteData = {
                title: title.trim(),
                content: content.trim(),
                format: 'text',
                content_type: 'manual'
            };

            console.log('🔍 Sending note data:', noteData); // Debug log

            // 🔧 FIX: Use 127.0.0.1 instead of localhost to match backend
            const response = await fetch('http://127.0.0.1:5000/notes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(noteData)
            });

            console.log('🔍 Response status:', response.status); // Debug log

            // 🔧 FIX: Better response handling
            if (response.ok) {
                const responseData = await response.json();
                console.log('🔍 Success response:', responseData); // Debug log
                setMessage('Note created successfully!');
                
                // Reset form
                setTitle('');
                setContent('');
                
                // Navigate to notes list after short delay
                setTimeout(() => {
                    navigate('/notes');
                }, 1500);
            } else {
                // 🔧 FIX: Handle different error response types
                let errorMessage = 'Unknown error';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || 'Unknown error';
                } catch {
                    // If response isn't JSON, get text
                    try {
                        const errorText = await response.text();
                        errorMessage = errorText || `HTTP ${response.status}`;
                    } catch {
                        errorMessage = `HTTP ${response.status}`;
                    }
                }
                
                console.error('🔍 Error response:', errorMessage); // Debug log
                setMessage(`Failed to create note: ${errorMessage}`);
                
                // Handle authentication errors
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        } catch (error) {
            console.error('🔍 Network error:', error); // Debug log
            
            // 🔧 FIX: Better error message for network issues
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                setMessage('Cannot connect to server. Please check if the backend is running.');
            } else {
                setMessage('Error creating note. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Reset form
    const handleReset = () => {
        setTitle('');
        setContent('');
        setMessage('');
    };

    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 p-8 ml-60">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Create New Note</h1>
                    
                    {/* Message Display */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${
                            message.includes('successfully')
                                ? 'bg-green-100 border border-green-300 text-green-700' 
                                : 'bg-red-100 border border-red-300 text-red-700'
                        }`}>
                            {message}
                        </div>
                    )}

                    {/* Note Creation Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title Input */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Note Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter your note title..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Simple Text Editor */}
                        <div>
                            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                                Note Content
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Start writing your note..."
                                rows={15}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical font-mono"
                                disabled={isLoading}
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                Tip: You can use basic formatting like line breaks and spacing in your note.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-4">
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={isLoading}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Clear
                            </button>
                            
                            <button
                                type="submit"
                                disabled={isLoading || !title.trim()}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Saving...' : 'Save Note'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}