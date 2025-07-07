import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function NotesList() {
    const navigate = useNavigate();
    
    // State management
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState('');

    // Log component mount and URL details
    useEffect(() => {
        console.log('🎯 NotesList component mounted');
        console.log('🎯 Current URL:', window.location.href);
        console.log('🎯 Browser localStorage keys:', Object.keys(localStorage));
        console.log('🎯 Token in localStorage:', !!localStorage.getItem('token'));
        
        // Check if we came from dashboard
        console.log('🎯 Document referrer:', document.referrer);
    }, []);

    // Fetch notes from backend
    const fetchNotes = React.useCallback(async () => {
        console.log('🚀 Starting fetchNotes...');
        
        try {
            const token = localStorage.getItem('token');
            console.log('🔍 Token exists:', !!token);
            console.log('🔍 Token length:', token ? token.length : 0);
            console.log('🔍 Token starts with:', token ? token.substring(0, 10) + '...' : 'null');
            
            if (!token) {
                console.log('❌ REDIRECT REASON: No token found in localStorage');
                console.log('❌ This means either:');
                console.log('   1. User never logged in properly');
                console.log('   2. Token was cleared/expired');
                console.log('   3. Login process failed to save token');
                navigate('/login');
                return;
            }

            console.log('🌐 Making API request to: http://127.0.0.1:5000/notes');
            console.log('🔑 Authorization header will be: Bearer ' + token.substring(0, 10) + '...');
            
            const response = await fetch('http://127.0.0.1:5000/notes', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Response received!');
            console.log('📡 Status:', response.status);
            console.log('📡 Status Text:', response.statusText);
            console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Raw API response:', data);
                console.log('✅ Data type:', typeof data);
                console.log('✅ Is array:', Array.isArray(data));
                console.log('✅ Length:', data.length);
                
                // Transform the data to match expected format
                const transformedNotes = data.map(note => ({
                    id: note._id,
                    _id: note._id,
                    title: note.title,
                    content: note.content,
                    content_type: note.content_type || 'manual',
                    format: note.format || 'text',
                    created_at: note.created_at || new Date().toISOString(),
                    updated_at: note.updated_at || note.created_at || new Date().toISOString(),
                    source_document: note.source_document,
                    source_video_id: note.source_video_id,
                    source_audio: note.source_audio,
                    audio_size: note.audio_size,
                    transcript: note.transcript
                }));
                
                console.log('✅ Transformed notes:', transformedNotes);
                setNotes(transformedNotes);
                setMessage('');
            } else {
                const errorText = await response.text();
                console.log('❌ Error body:', errorText);
                setMessage(`Failed to load notes (${response.status})`);
            }
        } catch (error) {
            console.error(' FETCH ERROR:', error);
            console.error(' Error name:', error.name);
            console.error(' Error message:', error.message);
            console.error(' Full error:', error);
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                setMessage(' Cannot connect to backend. Is it running on localhost:5000?');
            } else {
                setMessage('Network error. Please check your backend connection.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    // Delete note function
    const handleDeleteNote = async (noteId, noteTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${noteTitle}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:5000/notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
                setMessage('Note deleted successfully!');
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Failed to delete note');
            }
        } catch (error) {
            setMessage('Error deleting note. Please try again.');
            console.error('Delete note error:', error);
        }
    };

    // Load notes on component mount
    useEffect(() => {
        fetchNotes();
    }, [navigate, fetchNotes]);

    // Filter notes based on search term
    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // (Removed unused toggleNoteExpansion function)

    // Handler for retrying YouTube processing
    const handleRetryYouTube = (noteId, sourceVideoId) => {
        navigate(`/notes/ai-summary?retry=${sourceVideoId}`);
    };

    const getTypeInfo = (contentType) => {
        switch(contentType) {
            case 'pdf_summary':
                return { 
                    icon: '📄', 
                    label: 'PDF Summary', 
                    color: 'blue',
                    borderClass: 'border-l-4 border-l-blue-500 bg-blue-50'
                };
            case 'voice_transcription':  // ADD THIS CASE
                return { 
                    icon: '🎙️', 
                    label: 'Voice Note', 
                    color: 'green',
                    borderClass: 'border-l-4 border-l-green-500 bg-green-50'
                };
            case 'youtube_summary':
                return { 
                    icon: '🎬', 
                    label: 'YouTube Summary', 
                    color: 'green',
                    borderClass: 'border-l-4 border-l-green-500 bg-green-50'
                };
            case 'youtube_reference':
                return { 
                    icon: '📺', 
                    label: 'YouTube Reference', 
                    color: 'orange',
                    borderClass: 'border-l-4 border-l-orange-500 bg-orange-50'
                };
            case 'manual':
                return { 
                    icon: '✏️', 
                    label: 'Manual Note', 
                    color: 'gray',
                    borderClass: 'border-l-4 border-l-gray-500 bg-gray-50'
                };
            default:
                return { 
                    icon: '📝', 
                    label: 'Note', 
                    color: 'gray',
                    borderClass: 'border-l-4 border-l-gray-500 bg-gray-50'
                };
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 p-8 ml-60">
                <div className="max-w-6xl mx-auto">
                    {/* Header Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold">My Notes</h1>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                            </span>
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => navigate('/notes/create')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                ✏️ Create New Note
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search notes by title or content..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-400">🔍</span>
                            </div>
                        </div>
                    </div>

                    {/* Message Display */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg ${
                            message.includes('Error') || message.includes('Failed')
                                ? 'bg-red-100 border border-red-300 text-red-700'
                                : 'bg-green-100 border border-green-300 text-green-700'
                        }`}>
                            {message}
                        </div>
                    )}

                    {/* Notes List - To be implemented */}
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">⏳</div>
                            <div className="text-gray-600">Loading your notes...</div>
                        </div>
                    ) : (
                        <>
                            {/* Empty State */}
                            {filteredNotes.length === 0 && searchTerm === '' ? (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">📝</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No notes yet</h3>
                                    <p className="text-gray-600 mb-6">Start creating your first note to get organized!</p>
                                    <button
                                        onClick={() => navigate('/notes/create')}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        ✏️ Create Your First Note
                                    </button>
                                </div>
                            ) : filteredNotes.length === 0 && searchTerm !== '' ? (
                                <div className="text-center py-16">
                                    <div className="text-4xl mb-4">🔍</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No notes found</h3>
                                    <p className="text-gray-600">Try adjusting your search terms</p>
                                </div>
                            ) : (
                                /* Notes Grid */
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredNotes.map((note) => {
                                        const typeInfo = getTypeInfo(note.content_type);

                                        return (
                                            <div key={note.id} className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${typeInfo.borderClass}`}>
                                                {/* Note Header - CLEAN VERSION */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-lg">{typeInfo.icon}</span>
                                                        <span className="text-xs text-gray-600 font-medium">
                                                            {typeInfo.label}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Show creation date instead of action buttons */}
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(note.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>

                                                {/* Note Content */}
                                                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                                    {note.title}
                                                </h3>
                                                
                                                {/* Content Display */}
                                                <div className="text-gray-600 text-sm mb-4">
                                                    {note.content_type === 'youtube_reference' ? (
                                                        <div className="space-y-2">
                                                            <div className="text-orange-600 font-medium text-xs">
                                                                ⚠️ Transcript was unavailable
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Video ID: {note.source_video_id}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3">
                                                            {/* Content Preview */}
                                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                                                <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed line-clamp-3">
                                                                    {note.content ? (
                                                                        note.content.length > 150 
                                                                            ? note.content.substring(0, 150) + '...'
                                                                            : note.content
                                                                    ) : 'No content available'}
                                                                </div>
                                                            </div>

                                                            {/* Simple Stats */}
                                                            <div className="flex justify-between items-center text-xs text-gray-500">
                                                                <div className="flex space-x-4">
                                                                    {note.content && (
                                                                        <span>📝 {note.content.length} characters</span>
                                                                    )}
                                                                    {note.content_type === 'voice_transcription' && (
                                                                        <span>🎙️ Voice Note</span>
                                                                    )}
                                                                    {note.content_type === 'pdf_summary' && (
                                                                        <span>📄 PDF Summary</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* SINGLE SET OF ACTION BUTTONS - Only at bottom */}
                                                <div className="flex space-x-2">
                                                    {note.content_type === 'youtube_reference' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleRetryYouTube(note.id, note.source_video_id)}
                                                                className="text-green-600 hover:text-green-700 text-sm"
                                                                title="Retry YouTube processing"
                                                            >
                                                                🔄
                                                            </button>
                                                            <button
                                                                onClick={() => window.open(`https://www.youtube.com/watch?v=${note.source_video_id}`, '_blank')}
                                                                className="text-blue-600 hover:text-blue-700 text-sm"
                                                                title="Watch on YouTube"
                                                            >
                                                                📺
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => navigate(`/view-note/${note.id}`)}
                                                                className="text-green-600 hover:text-green-700 text-sm"
                                                                title="View full note"
                                                            >
                                                                👁️ view
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/edit-note/${note.id}`)}
                                                                className="text-blue-600 hover:text-blue-700 text-sm"
                                                                title="Edit note"
                                                            >
                                                                ✏️ edit
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteNote(note.id, note.title)}
                                                        className="text-red-600 hover:text-red-700 text-sm"
                                                        title="Delete note"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}