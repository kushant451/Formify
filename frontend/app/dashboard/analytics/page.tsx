"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import api from "../../../lib/api";

interface AnalyticsData {
  total: number;
  completed: number;
  failed: number;
  successRate: number;
  byDay: { _id: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.get("/analytics").then(({ data }) => setData(data));
  }, []);

  if (!data) return null;

  const chartData = data.byDay.map((d) => ({ day: d._id.slice(5), count: d.count }));

  return (
    <div>
      <h1 className="text-xl font-medium mb-1">Analytics</h1>
      <p className="text-sm text-gray-500 mb-5">Your generation activity this month</p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-surface-1 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Total generations</p>
          <p className="text-2xl font-medium">{data.total}</p>
        </div>
        <div className="bg-surface-1 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Completed</p>
          <p className="text-2xl font-medium">{data.completed}</p>
        </div>
        <div className="bg-surface-1 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">Success rate</p>
          <p className="text-2xl font-medium">{data.successRate}%</p>
        </div>
      </div>

      <div className="bg-surface-1 rounded-2xl p-5 shadow-md">
        <p className="text-xs text-gray-500 mb-3">Generations per day</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#D85A30" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
