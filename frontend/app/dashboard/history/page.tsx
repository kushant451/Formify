"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";

interface HistoryItem {
  _id: string;
  topic: string;
  tone: string;
  status: "generating" | "completed" | "failed";
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  generating: "bg-yellow-100 text-yellow-700",
};

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    api.get("/content/history").then(({ data }) => setItems(data.items));
  }, []);

  // Group by day for the calendar heatmap view
  const byDay: Record<string, number> = {};
  items.forEach((i) => {
    const day = new Date(i.createdAt).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  });

  return (
    <div>
      <h1 className="text-xl font-medium mb-1">History</h1>
      <p className="text-sm text-gray-500 mb-5">Everything you've generated so far</p>

      <div className="bg-surface-1 rounded-2xl p-5 shadow-md mb-5">
        <p className="text-xs text-gray-500 mb-3">Activity — darker means more generations that day</p>
        <div className="flex flex-wrap gap-1">
          {Object.entries(byDay).map(([day, count]) => (
            <div
              key={day}
              title={`${day}: ${count} generation(s)`}
              className="w-6 h-6 rounded"
              style={{
                background: `rgba(216,90,48,${Math.min(0.15 + count * 0.2, 1)})`,
              }}
            />
          ))}
          {Object.keys(byDay).length === 0 && (
            <p className="text-xs text-gray-400">No generations yet</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item._id} className="flex items-center justify-between bg-surface-1 rounded-xl px-4 py-3 shadow-sm">
            <div>
              <p className="text-sm font-medium">{item.topic}</p>
              <p className="text-xs text-gray-400 capitalize">5 formats · {item.tone}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[item.status]}`}>
              {item.status}
            </span>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">Nothing generated yet — head to Generate to start.</p>}
      </div>
    </div>
  );
}
