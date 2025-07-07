import React, { useState } from "react";
import Sidebar from "../Sidebar";

export default function CreateTask() {
    // Add state for form inputs
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');

    // states for form handling
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // handler submit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!title.trim()) {
            setMessage('Please enter a task title');
            return;
        }
        
        if (!priority) {
            setMessage('Please select a priority');
            return;
        }
        
        setLoading(true);
        setMessage('');
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/todos', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim() || "No description",
                    due_date: dueDate || new Date().toISOString().split('T')[0],
                    priority: priority,
                    status: "pending",
                    category: category.trim() || "General"
                })
            });
            
            if (response.ok) {
                setMessage('Task created successfully!');
                // Reset form
                setTitle('');
                setDescription('');
                setDueDate('');
                setCategory('');
                setPriority('');
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to create task');
            }
        } catch (error) {
            setMessage('Error creating task. Please try again.');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 p-8 ml-60">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6 text-center">Your Tasks</h1>
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-neutral-700 mb-4">Add New Task</h2>
                        
                        {/* ADD THIS MESSAGE DISPLAY HERE */}
                        {message && (
                            <div className={`mb-4 p-3 rounded-lg ${
                                message.includes('successfully') 
                                    ? 'bg-green-100 border border-green-300 text-green-700' 
                                    : 'bg-red-100 border border-red-300 text-red-700'
                            }`}>
                                {message}
                            </div>
                        )}
                        
                        {/* UPDATE THIS FORM TAG TO INCLUDE onSubmit */}
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Add new task..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                            />
                            <textarea
                                placeholder="Description (Optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 border border-b-black rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-100 bg-white h-24 resize-none"
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="px-4 py-3 border border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" 
                                />
                                <input
                                    type="text"
                                    placeholder="Category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                                />
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="px-4 py-3 border border-amber-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                                >
                                    <option value="">Select Priority</option>
                                    <option value="urgent">🔴 Urgent</option>
                                    <option value="high">🟠 High</option>
                                    <option value="normal">🟡 Normal</option>
                                    <option value="low">🟢 Low</option>
                                </select>
                            </div>
                                
                            <button
                                type="submit"
                                disabled={loading}
                                className="Button size- px-4 py-2 bg-slate-900 rounded-md inline-flex justify-center items-center gap-2.5 w-full hover:bg-slate-800 transition duration-200 disabled:opacity-50"                           
                            >
                                <div className="Continue justify-start text-white text-sm font-medium font-['Inter'] leading-normal">
                                    {loading ? 'Creating Task...' : 'Add Task'}
                                </div>
                            </button>
                        </form>

                    </div>
                </div>
            </main>
        </div>
    );
}