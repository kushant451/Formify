"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../../lib/api";
import { useAuth } from "../../context";

const TONES = ["professional", "casual", "humorous", "inspiring"];

const FORMATS = [
  { key: "blogPost", label: "Blog" },
  { key: "linkedInPost", label: "LinkedIn" },
  { key: "twitterThread", label: "Thread" },
  { key: "youtubeScript", label: "Script" },
  { key: "emailNewsletter", label: "Newsletter" },
];

export default function GeneratePage() {
  const { refreshUser } = useAuth();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [contentId, setContentId] = useState<string | null>(null);
  const [content, setContent] = useState<Record<string, string> | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("formify_last_content_id");
    if (!savedId) return;

    api
      .get(`/content/${savedId}`)
      .then(({ data }) => {
        setContentId(data.item._id);
        setTopic(data.item.topic);
        setTone(data.item.tone);
        setContent(data.item.generatedContent);
      })
      .catch(() => localStorage.removeItem("formify_last_content_id"));
  }, []);

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
        refreshUser();
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
      localStorage.setItem("formify_last_content_id", data.contentId);
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
      refreshUser();
      toast.success(`${format} regenerated`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Regeneration failed");
    } finally {
      setRegenerating(null);
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
                  {!loading && (
                    <button
                      type="button"
                      onClick={() => handleRegenerate(f.key)}
                      disabled={regenerating === f.key}
                      className="text-xs text-brand-400 px-2 py-1"
                    >
                      {regenerating === f.key ? "Regenerating..." : "🔄 Regenerate"}
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-700 whitespace-pre-wrap">
                  {content[f.key] || (loading ? "Waiting..." : "—")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}