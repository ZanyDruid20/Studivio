import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import your components
import LandingPage from "./components/LandingPage";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Logout from "./components/Logout";
import CreateTask from "./components/Tasks/CreateTask";
import TaskList from "./components/Tasks/TaskList";
import EditTask from "./components/Tasks/EditTask";
import NotesHub from "./components/Notes/NotesHub";
import CreateNote from "./components/Notes/CreateNote";
import SummaryNote from "./components/Notes/SummaryNote";
import NotesList from "./components/Notes/NotesList";
import VoiceNote from "./components/Notes/VoiceNote";
import EditNote from "./components/Notes/EditNote";
import ViewNote from "./components/Notes/ViewNote";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/logout" element={<Logout />} />
        
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/edit-task/:taskId" element={<EditTask />} />
        
        <Route path="/notes/create" element={<NotesHub />} />
        <Route path="/notes/create-manual" element={<CreateNote />} />
        <Route path="/notes/ai-summary" element={<SummaryNote />} />
        <Route path="/notes" element={<NotesList />} />
        <Route path="/notes/edit/:id" element={<CreateNote />} />
        <Route path="/voice-note" element={<VoiceNote />} />
        <Route path="/edit-note/:id" element={<EditNote />} />
        <Route path="/view-note/:id" element={<ViewNote />} />
      </Routes>
    </Router>
  );
}

export default App;
