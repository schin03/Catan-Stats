"use client";

import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DistributionEntry } from "@/lib/stats/rolls";

/** Bar chart of how often each total (2-12) was rolled, including totals with zero rolls. */
export function DiceChart({ data }: { data: DistributionEntry[] }) {
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <figure className="space-y-2">
      <div
        role="img"
        aria-label={`Bar chart of dice totals from 2 to 12 across ${total} ${total === 1 ? "roll" : "rolls"}. A table with the same numbers follows.`}
        className="h-64 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 18, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d9c9a3" />
            <XAxis dataKey="total" tickLine={false} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: "rgba(217, 201, 163, 0.35)" }} />
            <Bar dataKey="count" name="Rolls" fill="#3a6f8f" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="count" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Same data as text, for screen readers. */}
      <table className="sr-only">
        <caption>Number of rolls for each dice total</caption>
        <thead>
          <tr>
            <th scope="col">Total</th>
            <th scope="col">Rolls</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => (
            <tr key={entry.total}>
              <th scope="row">{entry.total}</th>
              <td>{entry.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="text-center text-sm text-muted">Dice total (red + yellow)</figcaption>
    </figure>
  );
}
