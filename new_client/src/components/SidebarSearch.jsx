import React from "react";
import { NavLink } from "react-router-dom";
import { FaSearch } from "react-icons/fa"; 
function SidebarSearch({ value, onChange }) {
    return (
        <input
            type="text"
            placeholder="Search..."
            value={value}
            onChange={e => onChange(e.target.value)}
            className="mb-4 px-2 py-1 rounded border border-gray-300 focus:outline-none"
        />
    );
}

export default SidebarSearch;