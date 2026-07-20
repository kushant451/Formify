"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import api from "../../../lib/api";

const TONES = ["professional", "casual", "humorous", "inspiring"];

const FORMATS = [
  { key: "blogPost", label: "Blog" },
  { key: "linkedInPost", label: "LinkedIn" },
  { key: "twitterThread", label: "Thread" },
  { key: "youtubeScript", label: "Script" },
  { key: "emailNewsletter", label: "Newsletter" },
];

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [contentId, setContentId] = useState<string | null>(null);
  const [content, setContent] = useState<Record<string, string> | null>(null);
  const [editingFormat, setEditingFormat] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  
  const startStreaming = (id: string) => {
    const token = localStorage.getItem("formify_token");
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const es = new EventSource(`${baseUrl}/stream/${id}?token=${token}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.content) setContent(data.content);

      if (data.status === "completed") {
        setLoading(false);
        es.close();
      } else if (data.status === "failed") {
        toast.error("Generation failed after retries. Please try again.");
        setLoading(false);
        es.close();
      }
    };

    es.onerror = () => {

      es.close();
      setLoading(false);
      toast.error("Connection lost. Check History for the result.");
    };
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setContent(null);
    eventSourceRef.current?.close();

    try {
      const { data } = await api.post("/content/generate", { topic, tone });
      setContentId(data.contentId);
      startStreaming(data.contentId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to start generation");
      setLoading(false);
    }
  };

  const handleRegenerate = async (format: string) => {
    if (!contentId) return;
    setRegenerating(format);
    try {
      const { data } = await api.post(`/content/${contentId}/regenerate`, { format });
      setContent(data.content);
      toast.success(`${format} regenerated`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Regeneration failed");
    } finally {
      setRegenerating(null);
    }
  };

  const startEditing = (format: string) => {
    setEditingFormat(format);
    setDraftText(content?.[format] || "");
  };

  const cancelEditing = () => {
    setEditingFormat(null);
    setDraftText("");
  };

  const saveEdit = async (format: string) => {
    if (!contentId) return;
    setSaving(format);
    try {
      const { data } = await api.patch(`/content/${contentId}`, { format, text: draftText });
      setContent(data.content);
      toast.success(`${format} saved`);
      setEditingFormat(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save edit");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-medium mb-1">Generate content</h1>
      <p className="text-sm text-gray-500 mb-5">Turn one idea into five formats, instantly</p>

      <form onSubmit={handleGenerate} className="bg-surface-1 rounded-2xl p-6 shadow-md mb-5">
        <label className="text-xs text-gray-500">Topic or idea</label>
        <textarea
          rows={2}
          className="w-full rounded-xl mt-1 mb-4"
          placeholder="e.g. Why every developer should learn AI in 2026"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
        <label className="text-xs text-gray-500">Tone</label>
        <div className="flex gap-2 flex-wrap mt-2 mb-5">
          {TONES.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTone(t)}
              className={`px-4 py-1.5 rounded-full text-xs capitalize ${
                tone === t ? "bg-brand-400 text-white" : "bg-surface-0 text-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <button disabled={loading} className="bg-brand-400 text-white rounded-xl px-5">
          {loading ? "Generating live..." : "Generate content"}
        </button>
      </form>

      {content && (
        <div>
          <p className="text-xs text-gray-500 mb-3">
            {loading ? "Streaming in as each format finishes..." : "Results — regenerate any single format if you don't like it"}
          </p>
          {!loading && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">
              ⚠️ AI-generated content. Facts, figures, and dates may not reflect the latest updates — please verify before publishing.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FORMATS.map((f) => (
              <div key={f.key} className="bg-surface-1 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">{f.label}</span>
                  {!loading && editingFormat !== f.key && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEditing(f.key)}
                        disabled={!content[f.key]}
                        className="text-xs text-gray-500 px-2 py-1"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRegenerate(f.key)}
                        disabled={regenerating === f.key}
                        className="text-xs text-brand-400 px-2 py-1"
                      >
                        {regenerating === f.key ? "Regenerating..." : "🔄 Regenerate"}
                      </button>
                    </div>
                  )}
                </div>

                {editingFormat === f.key ? (
                  <div>
                    <textarea
                      rows={10}
                      className="w-full rounded-xl text-xs text-gray-700"
                      value={draftText}
                      onChange={(e) => setDraftText(e.target.value)}
                      autoFocus
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(f.key)}
                        disabled={saving === f.key || !draftText.trim()}
                        className="bg-brand-400 text-white text-xs rounded-lg px-3 py-1.5"
                      >
                        {saving === f.key ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={saving === f.key}
                        className="text-xs text-gray-500 px-3 py-1.5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">
                    {content[f.key] || (loading ? "Waiting..." : "—")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}