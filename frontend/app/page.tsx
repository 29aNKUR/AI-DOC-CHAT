"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    console.log("Uploading file:", file.name);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);
      setUploaded(true);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };
  const handleAsk = async () => {
    if (!question) return;
    setLoading(true);
    const res = await fetch("http://localhost:8000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    setAnswer(data.answer);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">AI Doc Chat 🤖</h1>
        <p className="text-gray-400 text-center mb-8">
          Upload a PDF and ask anything about it
        </p>
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Step 1 — Upload your PDF
          </h2>
          <label
            className="flex flex-col items-center justify-center w-full h-32 
  border-2 border-dashed border-gray-600 hover:border-blue-500 
  rounded-xl cursor-pointer bg-gray-800 hover:bg-gray-750 
  transition-all duration-200 mb-4 group"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-2 text-gray-400 group-hover:text-blue-400 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-400 group-hover:text-blue-400 transition-colors">
                {file ? (
                  <span className="text-green-400 font-medium">
                    📄 {file.name}
                  </span>
                ) : (
                  <span>
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF files only</p>
            </div>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                console.log("File selected:", e.target.files);
                setFile(e.target.files?.[0] || null);
              }}
            />
          </label>
          <button
            onClick={() => {
              console.log("Button clicked, file:", file);
              handleUpload();
            }}
            disabled={!file || uploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 
  disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium 
  transition-colors"
          >
            {uploading ? "Uploading..." : "Upload PDF"}
          </button>
          {uploaded && (
            <p className="text-green-400 mt-3">✅ PDF uploaded successfully!</p>
          )}
        </div>
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Step 2 — Ask a question
          </h2>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What is this document about?"
            className="w-full bg-gray-800 text-white rounded-lg p-3 mb-4 
            resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAsk}
            disabled={!uploaded || !question || loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 
            disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium 
            transition-colors"
          >
            {loading ? "Thinking..." : "Ask AI"}
          </button>
        </div>
        {answer && (
          <div className="bg-gray-900 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">Answer</h2>
            <p className="text-gray-300 leading-relaxed">{answer}</p>
          </div>
        )}
      </div>
    </main>
  );
}
