"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const STATUS_COLORS = {
  complete: "#16a34a",
  in_progress: "#2563eb",
  not_started: "#94a3b8",
  delayed: "#dc2626",
};

export function OverallPie({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
      <h3 className="font-semibold text-zinc-900 mb-3">Status Breakdown</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
            {data.map((d) => (
              <Cell key={d.name} fill={STATUS_COLORS[d.name as keyof typeof STATUS_COLORS]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3 text-xs mt-2">
        {data.map((d) => (
          <span key={d.name} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name as keyof typeof STATUS_COLORS] }} />
            {d.name.replace("_", " ")} ({d.value})
          </span>
        ))}
      </div>
    </div>
  );
}

export function AreaBarChart({ data }: { data: { name: string; pct: number }[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
      <h3 className="font-semibold text-zinc-900 mb-3">Completion by Focus Area</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={90} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
            {data.map((d) => (
              <Cell key={d.name} fill={`hsl(${Math.min(d.pct, 100) * 1.2}, 75%, 40%)`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FocusAreaPies({ data }: { data: { name: string; statuses: { name: string; value: number }[] }[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-5">
      <h3 className="font-semibold text-zinc-900 mb-3">Status per Focus Area</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((area) => (
          <div key={area.name}>
            <p className="text-xs font-medium text-zinc-600 mb-1 truncate">{area.name}</p>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={area.statuses} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={40} innerRadius={20}>
                  {area.statuses.map((s) => (
                    <Cell key={s.name} fill={STATUS_COLORS[s.name as keyof typeof STATUS_COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
