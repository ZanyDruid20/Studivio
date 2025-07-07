import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <section className="min-h-screen bg-white flex flex-col justify-center items-center px-8 py-20 text-center">
      {/* Main heading */}
      <h1 className="text-6xl font-extrabold text-black mb-6 max-w-4xl leading-tight tracking-tight">
        Studivio —{" "}
        <span className="text-gray-700">Organize & Master Your Study Materials</span>
      </h1>

      {/* Subheading */}
      <p className="max-w-3xl text-gray-600 text-lg mb-12">
        Upload, summarize, and search your notes with AI-powered tools built for students who want clarity, not clutter.
      </p>

      {/* Call to action button */}
      <Link
        to="/register"
        className="inline-block bg-black text-white px-10 py-4 rounded-full text-lg font-semibold shadow hover:bg-gray-800 transition-colors duration-300"
      >
        Get Started Free
      </Link>

      {/* Feature cards section */}
      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-5xl w-full px-4">
        <FeatureCard
          icon="📄"
          title="Upload Notes"
          description="Upload PDFs, audio, and video files all in one clean interface."
        />
        <FeatureCard
          icon="🤖"
          title="AI Summaries"
          description="Get sharp, concise summaries in seconds."
        />
        <FeatureCard
          icon="🔍"
          title="Smart Search"
          description="Find anything instantly with intelligent tagging and search."
        />
      </div>
    </section>
  );
}

// FeatureCard component for displaying features
function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center bg-white border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-black mb-2">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
}
