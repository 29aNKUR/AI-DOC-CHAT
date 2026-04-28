"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [askError, setAskError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setUploaded(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.detail || `Upload failed with status ${res.status}`,
        );
      }

      await res.json();
      setUploaded(true);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setUploadError(
          "Cannot connect to the server. Please check your connection and try again.",
        );
      } else if (error instanceof Error) {
        setUploadError(error.message);
      } else {
        setUploadError("Something went wrong during upload. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!question) return;
    setLoading(true);
    setAskError(null);
    setAnswer("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(
          errorData?.detail || `Request failed with status ${res.status}`,
        );
      }

      const data = await res.json();

      if (!data.answer) {
        throw new Error("No answer received from the server.");
      }

      setAnswer(data.answer);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        setAskError(
          "Cannot connect to the server. Please check your connection and try again.",
        );
      } else if (error instanceof Error) {
        setAskError(error.message);
      } else {
        setAskError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
                setFile(e.target.files?.[0] || null);
                setUploaded(false);
                setUploadError(null);
              }}
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 
            disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium 
            transition-colors"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload PDF"
            )}
          </button>

          {uploaded && (
            <p className="text-green-400 mt-3 flex items-center gap-2">
              ✅ PDF uploaded successfully! You can now ask questions.
            </p>
          )}

          {uploadError && (
            <div className="mt-3 p-3 bg-red-900/40 border border-red-500/50 rounded-lg flex items-start gap-2">
              <span className="text-red-400 mt-0.5">⚠️</span>
              <p className="text-red-300 text-sm">{uploadError}</p>
            </div>
          )}
        </div>

        {/* Ask Section */}
        <div className="bg-gray-900 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            Step 2 — Ask a question
          </h2>

          {!uploaded && (
            <p className="text-gray-500 text-sm mb-3 italic">
              Upload a PDF first to enable this section.
            </p>
          )}

          <textarea
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              setAskError(null);
            }}
            placeholder="What is this document about?"
            disabled={!uploaded}
            className="w-full bg-gray-800 text-white rounded-lg p-3 mb-4 
            resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed"
          />

          <button
            onClick={handleAsk}
            disabled={!uploaded || !question || loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 
            disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium 
            transition-colors"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Thinking...
              </span>
            ) : (
              "Ask AI"
            )}
          </button>

          {askError && (
            <div className="mt-3 p-3 bg-red-900/40 border border-red-500/50 rounded-lg flex items-start gap-2">
              <span className="text-red-400 mt-0.5">⚠️</span>
              <p className="text-red-300 text-sm">{askError}</p>
            </div>
          )}
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
