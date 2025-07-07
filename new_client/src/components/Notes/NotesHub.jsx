import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function NotesHub() {
    const navigate = useNavigate();

    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 p-8 ml-60">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold mb-4">Create New Note</h1>
                        <p className="text-lg text-gray-600">
                            Choose how you'd like to create your note
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Manual Note Creation Option */}
                        <div 
                            className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
                            onClick={() => navigate('/notes/create-manual')}
                        >
                            <div className="text-center">
                                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-200">
                                    ✏️
                                </div>
                                
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                    Write Manually
                                </h2>
                                
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Create notes from scratch using our rich text editor. 
                                    Perfect for personal thoughts, meeting notes, brainstorming, 
                                    and original content creation.
                                </p>
                                
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center justify-center text-sm text-gray-500">
                                        <span className="mr-2">✓</span>
                                        Rich text formatting
                                    </div>
                                    <div className="flex items-center justify-center text-sm text-gray-500">
                                        <span className="mr-2">✓</span>
                                        Headers, lists, and links
                                    </div>
                                    <div className="flex items-center justify-center text-sm text-gray-500">
                                        <span className="mr-2">✓</span>
                                        Full creative control
                                    </div>
                                </div>
                                
                                <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                    Start Writing
                                </button>
                            </div>
                        </div>

                        {/* AI-Powered Summarization Option */}
                        <div 
                            className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg hover:border-green-300 transition-all duration-200 cursor-pointer group"
                            onClick={() => navigate('/notes/ai-summary')}
                        >
                            <div className="text-center">
                                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-200">
                                    🤖
                                </div>
                                
                                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                    AI Summarization
                                </h2>
                                
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Generate intelligent summaries from PDFs and YouTube videos. 
                                    Let AI extract key insights and create structured notes 
                                    automatically.
                                </p>
                                
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center justify-center text-sm text-gray-500">
                                        <span className="mr-2">✓</span>
                                        PDF document processing
                                    </div>
                                    <div className="flex items-center justify-center text-sm text-gray-500">
                                        <span className="mr-2">✓</span>
                                        YouTube video summaries
                                    </div>
                                    <div className="flex items-center justify-center text-sm text-gray-500">
                                        <span className="mr-2">✓</span>
                                        AI-powered insights
                                    </div>
                                </div>
                                
                                <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                                    Use AI Tools
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-16 text-center">
                        <div className="flex justify-center space-x-4">
                            <button 
                                onClick={() => navigate('/notes')}
                                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                📋 View All Notes
                            </button>
                            
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="px-8 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                ← Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}