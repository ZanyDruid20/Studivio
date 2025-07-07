import React, {useState, useEffect} from "react";
import { useNavigate } from 'react-router-dom'; // Add this import
import Sidebar from "../Sidebar";

export default function TaskList() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); 
    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
             console.log('Token:', token); // Debug: Check if token exists
            const response = await fetch('http://localhost:5000/todos', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Raw response data:', data); // Debug: See raw data
                setTasks(data || []); 
            } else {
                console.error('Failed to fetch tasks');
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };
    const toggleTaskCompletion = async (taskId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
            
            const response = await fetch(`http://localhost:5000/todos/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: newStatus
                })
            });
            
            if (response.ok) {
                setTasks(tasks.map(task => 
                    task._id === taskId 
                        ? { ...task, status: newStatus }
                        : task
                ));
            } else {
                console.error('Failed to update task');
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };
    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/todos/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            
            if (response.ok) {
                setTasks(tasks.filter(task => task._id !== taskId));
            } else {
                console.error('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleEditTask = (task) => {
        navigate(`/edit-task/${task._id}`, { state: { task } });
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1 p-8 ml-60">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Recent Tasks</h1>
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Loading tasks...</p>
                        </div>
                    ) : tasks.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No tasks yet. Create your first task!</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {tasks.map((task) => (
                                <div key={task._id} className="border-b border-gray-200 last:border-b-0 p-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        {/* Custom checkbox */}
                                        <button
                                            onClick={() => toggleTaskCompletion(task._id, task.status)}
                                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                                task.status === 'completed'
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'border-gray-300 hover:border-amber-400'
                                            }`}
                                        >
                                            {task.status === 'completed' && (
                                                <span className="text-white font-bold">✓</span>
                                            )}
                                        </button>
                                        
                                        <div>
                                            <h3 className={`font-medium ${
                                                task.status === 'completed' 
                                                    ? 'text-gray-500 line-through' 
                                                    : 'text-gray-900'
                                            }`}>
                                                {task.title}
                                            </h3>
                                            <p className="text-sm text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        {/* Priority badge */}
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                            task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                            task.priority === 'normal' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {task.priority}
                                        </span>
                                        
                                        <span className={`px-3 py-1 text-sm font-medium rounded-md ${
                                            task.status === 'completed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {task.status === 'completed' ? 'Completed' : 'Pending'}
                                        </span>

                                        {/* Edit and Delete buttons */}
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => handleEditTask(task)}
                                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTask(task._id)}
                                                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </main>

        </div>
    );
}