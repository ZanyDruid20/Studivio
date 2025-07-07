import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function Logout() {
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        const logout = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                await fetch("http://localhost:5000/Logout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });
            }
            // Remove authentication data
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Show message then redirect user after 2 seconds
            setTimeout(() => setRedirect(true), 2000);
        };
        logout();
    }, []);

    if (redirect) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="text-xl font-semibold text-gray-700">
                You have been logged out.
            </div>
        </div>
    );
}