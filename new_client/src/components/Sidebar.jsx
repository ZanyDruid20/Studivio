import React, { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { FaTachometerAlt, FaTasks, FaStickyNote, FaBars, FaTimes } from "react-icons/fa";
import SidebarSearch from "./SidebarSearch";

const navItems = [
    { to: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
    { to: "/tasks", icon: <FaTasks />, label: "Tasks" },
    { to: "/notes", icon: <FaStickyNote />, label: "Notes" },
];

export default function Sidebar() {
    const [open, setOpen] = useState(true);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const filteredNavItems = navItems.filter(item =>
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    // Sidebar toggle button (hamburger) for when sidebar is closed
    if (!open) {
        return (
            <button
                className="fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
                onClick={() => setOpen(true)}
                aria-label="Open sidebar"
            >
                <FaBars size={24} />
            </button>
        );
    }

    return (
        <aside className="h-screen w-60 bg-white text-gray-900 flex flex-col p-4 shadow-lg fixed z-40">
            <button
                className="self-end mb-4 text-gray-500 hover:text-black"
                onClick={() => setOpen(false)}
                aria-label="Close sidebar"
            >
                <FaTimes size={24} />
            </button>
            <div className="mb-8 text-2xl font-bold">Studivio</div>
            <SidebarSearch value={search} onChange={setSearch} />
            <nav className="flex flex-col gap-4" aria-label="Main navigation">
                {filteredNavItems.map(({ to, icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 ${
                                isActive ? "bg-gray-200 font-semibold" : ""
                            }`
                        }
                    >
                        {icon} {label}
                    </NavLink>
                ))}
                {/* Add this link in your navigation section */}
                <Link 
                    to="/voice-note" 
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                    🎙️ Voice Notes
                </Link>
            </nav>
            <div className="mt-auto pt-8 border-t">
                <div className="text-sm">
                    Logged in as <span className="font-semibold">User</span>
                </div>
                <div
                    className="Button size- px-4 py-2 bg-slate-900 rounded-md inline-flex justify-center items-center gap-2.5 mt-2 cursor-pointer"
                    tabIndex={0}
                    role="button"
                    aria-label="Logout"
                    onClick={() => navigate("/logout")}
                >
                    <div className="Continue justify-start text-white text-sm font-medium font-['Inter'] leading-normal">
                        Logout
                    </div>
                </div>
            </div>
        </aside>
    );
}