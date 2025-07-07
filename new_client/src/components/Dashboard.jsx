import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="flex">
            <Sidebar />
            <main className="bg-white rounded-lg pb-4 shadow h-[200vh] flex flex-col items-center flex-1">
                <h1 className="text-2xl font-bold mb-8 mt-8">Welcome to your Dashboard</h1>
                
                {/* Main Action Buttons */}
                <div className="flex gap-6 mb-12">
                    <button 
                        onClick={() => navigate("/create-task")}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg shadow hover:bg-violet-600 transition font-semibold"
                    >
                        + Create Task
                    </button>
                    <button 
                        onClick={() => navigate("/notes/create")}
                        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition font-semibold"
                    >
                        + Create Notes
                    </button>
                </div>

                {/* Quick Access Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl">
                    {/* Tasks Card */}
                    <div 
                        onClick={() => navigate("/tasks")}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                        <div className="text-3xl mb-2">✅</div>
                        <div className="font-semibold text-blue-700">My Tasks</div>
                        <div className="text-sm text-blue-600">View and manage tasks</div>
                    </div>

                    {/* Notes Card */}
                    <div 
                        onClick={() => navigate("/notes")}
                        className="bg-green-50 border border-green-200 rounded-lg p-6 hover:bg-green-100 transition-colors cursor-pointer"
                    >
                        <div className="text-3xl mb-2">📝</div>
                        <div className="font-semibold text-green-700">My Notes</div>
                        <div className="text-sm text-green-600">View all notes</div>
                    </div>

                    {/* Manual Notes Card */}
                    <div 
                        onClick={() => navigate("/notes/create-manual")}
                        className="bg-purple-50 border border-purple-200 rounded-lg p-6 hover:bg-purple-100 transition-colors cursor-pointer"
                    >
                        <div className="text-3xl mb-2">✏️</div>
                        <div className="font-semibold text-purple-700">Write Note</div>
                        <div className="text-sm text-purple-600">Create manually</div>
                    </div>

                    {/* AI Notes Card */}
                    <div 
                        onClick={() => navigate("/notes/ai-summary")}
                        className="bg-orange-50 border border-orange-200 rounded-lg p-6 hover:bg-orange-100 transition-colors cursor-pointer"
                    >
                        <div className="text-3xl mb-2">🤖</div>
                        <div className="font-semibold text-orange-700">AI Summary</div>
                        <div className="text-sm text-orange-600">PDF & Audio Files</div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;