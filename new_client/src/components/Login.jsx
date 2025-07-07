import React, {useState} from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
     const navigate = useNavigate();
    // Login Logic
    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const res = await fetch("http://localhost:5000/Login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password }),
            });
            const data = await res.json();
            
            console.log('🔍 Backend response:', data); // Debug log
            
            if (res.status === 200) {
                // 🔧 FIX: Your backend returns {access_token: "..."} 
                if (data.access_token) {
                    localStorage.setItem('token', data.access_token);
                    setMessage("Login Successful");
                    navigate("/dashboard");
                } else {
                    setMessage("Login successful but no token received");
                }
            } else {
                setMessage(data.message || "Login Failed");
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage("Network Error");
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-amber-50">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-sm p-6 bg-white rounded-lg border-2 border-[#2b493a] flex flex-col gap-6 shadow"
                style={{minWidth: 320}}
            
            >
                {/*Email Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-[#1E1E1E] text-base font-normal">Email</label>
                    <input
                        className="w-full min-w-[240px] px-4 py-3 bg-white text-black placeholder:text-gray-400 rounded-lg border border-[#D9D9D9] outline-none"
                        placeholder="Value"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        type="email"
                        required
                    ></input>
                </div>
                 {/* Password Field */}
                 <div className="flex flex-col gap-2">
                    <label className="text-[#1E1E1E] text-base font-normal">Password</label>
                     <input
                        className="w-full min-w-[240px] px-4 py-3 bg-white text-black placeholder:text-gray-400 rounded-lg border border-[#D9D9D9] outline-none"
                        placeholder="Value"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                        required
                    />
                 </div>
                 {/* Sign In Button */}
                 <button
                    type="submit"
                    className="w-full py-3 bg-[#2C2C2C] text-[#F5F5F5] rounded-lg border border-[#2C2C2C] font-normal text-base"
                >
                    Sign In
                </button>
                {/* Forgot to Register Link */}
                <div className="text-center mt-4">
                    <Link to="/register" className="text-[#381E72] underline">
                        Forgot to register? Sign up here
                    </Link>
                </div>
                {/* Message */}
                {message && (
                    <div className="text-center text-red-400 mt-2">{message}</div>
                )}
            </form>
        </div>
    )
    
}