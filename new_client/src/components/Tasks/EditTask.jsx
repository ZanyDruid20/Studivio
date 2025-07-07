import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';

export default function EditTask() {
    // Get task ID from URL and task data from navigation state
    const { taskId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Form state - initialize with existing task data
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');
    
    // Form handling state
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Load existing task data when component mounts
    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:5000/todos/${taskId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const task = await response.json();
                    setTitle(task.title || '');
                    setDescription(task.description || '');
                    setDueDate(task.due_date || '');
                    setCategory(task.category || '');
                    setPriority(task.priority || '');
                } else {
                    setMessage('Failed to load task data');
                }
            } catch (error) {
                setMessage('Error loading task data');
                console.error('Error:', error);
            }
        };

        const taskData = location.state?.task;
        if (taskData) {
            setTitle(taskData.title || '');
            setDescription(taskData.description || '');
            setDueDate(taskData.due_date || '');
            setCategory(taskData.category || '');
            setPriority(taskData.priority || '');
        } else {
            // If no task data in state, fetch from API
            fetchTaskData();
        }
    }, [taskId, location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
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
            const response = await fetch(`http://localhost:5000/todos/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim() || "No description",
                    due_date: dueDate || new Date().toISOString().split('T')[0],
                    priority: priority,
                    category: category.trim() || "General"
                })
            });
            
            if (response.ok) {
                setMessage('Task updated successfully!');
                // Navigate back to task list after successful update
                setTimeout(() => {
                    navigate('/tasks');
                }, 1500);
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || 'Failed to update task');
            }
        } catch (error) {
            setMessage('Error updating task. Please try again.');
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
                    <h1 className="text-2xl font-bold mb-6 text-center">Edit Task</h1>
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-neutral-700 mb-4">Update Task Details</h2>
                        
                        {/* Message display */}
                        {message && (
                            <div className={`mb-4 p-3 rounded-lg ${
                                message.includes('successfully') 
                                    ? 'bg-green-100 border border-green-300 text-green-700' 
                                    : 'bg-red-100 border border-red-300 text-red-700'
                            }`}>
                                {message}
                            </div>
                        )}
                        
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Task title..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                            />
                            
                            <textarea
                                placeholder="Description (Optional)"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white h-24 resize-none"
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
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
                                    className="px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                                >
                                    <option value="">Select Priority</option>
                                    <option value="urgent">🔴 Urgent</option>
                                    <option value="high">🟠 High</option>
                                    <option value="normal">🟡 Normal</option>
                                    <option value="low">🟢 Low</option>
                                </select>
                            </div>
                            
                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 Button size- px-4 py-2 bg-slate-900 rounded-md inline-flex justify-center items-center gap-2.5 hover:bg-slate-800 transition duration-200 disabled:opacity-50"
                                >
                                    <div className="Continue justify-start text-white text-sm font-medium font-['Inter'] leading-normal">
                                        {loading ? 'Updating Task...' : 'Update Task'}
                                    </div>
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={() => navigate('/tasks')}
                                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}