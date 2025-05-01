// src/app/settings/api-text/_components/ApiTextForm.tsx
// src/app/settings/api-text/_components/ApiTextForm.tsx
"use client";

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useState, useEffect } from "react";

export default function ApiTextSettings() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });

  useEffect(() => {
    const loadText = async () => {
      try {
        const response = await fetch('/api/admin/settings/api-text');
        const { text } = await response.json();
        setText(text);
      } catch (error) {
        setMessage({ type: "error", content: "Failed to load settings" });
      } finally {
        setIsLoading(false);
      }
    };
    loadText();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings/api-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      setMessage({ type: "success", content: "Settings saved successfully!" });
    } catch (error) {
      setMessage({ type: "error", content: "Failed to save settings" });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="mx-auto w-full max-w-[1080px]">

           <ShowcaseSection title="PDF Note" className="!p-6.5">
      {message.content && (
        <div className={`mb-4 p-3 rounded ${
          message.type === "success" 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {message.content}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="apiText" className="block text-sm font-medium text-gray-700 mb-2">
            Certificate Text
          </label>
          <textarea
            id="apiText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            This text will appear at the PDF of all the verification certificates.
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isSaving}
          className={`px-4 py-2 rounded-md text-white ${
            isSaving 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
      </ShowcaseSection>
    </div>
  );
}