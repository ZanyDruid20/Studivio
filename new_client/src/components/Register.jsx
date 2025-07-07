import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // <-- Add this

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await res.json();
      if (res.status === 201) {
        setMessage("Registration Successful");
        navigate("/dashboard"); // <-- Redirect here
      } else if (res.status === 409) {
        setMessage("The user already exists");
      } else {
        setMessage(data.Message || "Registration Failed");
      }
    } catch {
      setMessage("Network Error");
    }
  };

  return (
    // Center the form vertically and horizontally
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md p-6 bg-[#381E72] rounded-lg border border-[#444] flex flex-col gap-6"
      >
        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-base font-normal">Email</label>
          <input
            className="w-full min-w-[240px] px-4 py-3 bg-[#1E1E1E] text-white placeholder:text-white/40 rounded-lg border border-[#444] outline-none"
            placeholder="Value"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>
        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <label className="text-white text-base font-normal">Password</label>
          <input
            className="w-full min-w-[240px] px-4 py-3 bg-[#1E1E1E] text-white placeholder:text-white/40 rounded-lg border border-[#444] outline-none"
            placeholder="Value"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>
        {/* Checkbox */}
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="w-4 h-4 rounded bg-[#F5F5F5] border-none"
            />
            <span className="text-white text-base font-normal">Remember Me</span>
          </label>
        </div>
        {/* Register Button */}
        <button
          type="submit"
          className="w-full py-3 bg-[#F5F5F5] text-[#1E1E1E] rounded-lg border border-[#F5F5F5] font-normal text-base"
          disabled={!agree}
        >
          Register
        </button>
        {/* Sign In Link */}
        <Link
          to="/login"
          className="w-full block py-3 bg-black text-amber-50 rounded-lg border border-amber-50 font-normal text-base text-center mt-2"
        >
          Sign in
        </Link>
        {/* Message */}
        {message && (
          <div className="text-center text-red-400 mt-2">{message}</div>
        )}
      </form>
    </div>
  );
}