"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

const STATUS_COLORS = {
  complete: "#16a34a",
  in_progress: "#2563eb",
  not_started: "#94a3b8",
  delayed: "#dc2626",
};

const STATUS_ORDER = ["complete", "in_progress", "delayed", "not_started"];

export function StackedAreaChart({ data }: {
  data: { name: string; complete: number; in_progress: number; delayed: number; not_started: number }[];
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Status by Focus Area</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 110 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {STATUS_ORDER.map((s) => (
            <Bar key={s} dataKey={s} stackId="a" fill={STATUS_COLORS[s as keyof typeof STATUS_COLORS]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DepartmentPie({ data }: { data: { name: string; value: number }[] }) {
  const DEPT_COLORS = ["#0891b2", "#7c3aed", "#ca8a04", "#dc2626", "#16a34a", "#2563eb", "#db2777", "#ea580c"];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Outcomes by Department</h2>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
            {data.map((d, i) => (
              <Cell key={d.name} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs mt-2">
        {data.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }} />
            {d.name} ({d.value})
          </span>
        ))}
      </div>
    </div>
  );
}

export function LeadBarChart({ data }: { data: { name: string; outcomes: number }[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
      <h2 className="text-lg font-semibold mb-4">Outcomes per SLT Lead</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: 70 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="outcomes" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={d.name} fill={i === 0 ? "#d30918" : "#e84555"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
