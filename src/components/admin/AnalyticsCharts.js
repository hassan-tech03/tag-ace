"use client";

import { useMemo, useState } from "react";

// Polyline-based area chart with no external chart dependency. Renders both a
// filled "paid revenue" area and an orders count overlay (normalized).
export function RevenueChart({ series }) {
  const [hover, setHover] = useState(null);

  const { width, height, padX, padY, points, ordersPoints, maxRevenue, maxOrders } =
    useMemo(() => {
      const w = 720;
      const h = 220;
      const pX = 36;
      const pY = 20;
      const innerW = w - pX * 2;
      const innerH = h - pY * 2;
      const n = Math.max(1, series.length);

      const revenues = series.map((s) => s.revenue || 0);
      const orders = series.map((s) => s.orders || 0);
      const maxR = Math.max(1, ...revenues);
      const maxO = Math.max(1, ...orders);

      const stepX = innerW / Math.max(1, n - 1);

      const pts = series.map((s, i) => {
        const x = pX + i * stepX;
        const y = pY + innerH - ((s.revenue || 0) / maxR) * innerH;
        return { x, y, ...s };
      });
      const oPts = series.map((s, i) => {
        const x = pX + i * stepX;
        const y = pY + innerH - ((s.orders || 0) / maxO) * innerH;
        return { x, y };
      });

      return {
        width: w,
        height: h,
        padX: pX,
        padY: pY,
        points: pts,
        ordersPoints: oPts,
        maxRevenue: maxR,
        maxOrders: maxO,
      };
    }, [series]);

  const innerH = height - padY * 2;
  const innerW = width - padX * 2;
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath =
    `M${points[0]?.x || padX},${padY + innerH} ` +
    points.map((p) => `L${p.x},${p.y}`).join(" ") +
    ` L${points[points.length - 1]?.x || padX + innerW},${padY + innerH} Z`;
  const orderPath = ordersPoints
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * width;
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - x);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    setHover(nearest);
  }

  const tooltip = hover != null ? points[hover] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-[220px]"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="revGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <line
            key={p}
            x1={padX}
            x2={width - padX}
            y1={padY + innerH * p}
            y2={padY + innerH * p}
            stroke="#e2e8f0"
            strokeDasharray={p === 1 ? "0" : "2,3"}
          />
        ))}

        {points.length > 0 && (
          <>
            <path d={areaPath} fill="url(#revGrad)" />
            <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="2" />
            <path
              d={orderPath}
              fill="none"
              stroke="#0f172a"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.65"
            />
          </>
        )}

        {tooltip && (
          <g>
            <line
              x1={tooltip.x}
              x2={tooltip.x}
              y1={padY}
              y2={padY + innerH}
              stroke="#94a3b8"
              strokeDasharray="2,2"
            />
            <circle cx={tooltip.x} cy={tooltip.y} r="4" fill="#f59e0b" />
          </g>
        )}

        <text x={padX} y={padY - 6} fontSize="10" fill="#64748b">
          ${maxRevenue.toFixed(0)}
        </text>
        <text x={padX} y={padY + innerH + 14} fontSize="10" fill="#64748b">
          $0
        </text>
      </svg>

      {tooltip && (
        <div
          className="absolute -top-2 bg-slate-900 text-white text-xs rounded-md px-2 py-1.5 pointer-events-none shadow-lg"
          style={{
            left: `${(tooltip.x / width) * 100}%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="font-medium">
            {new Date(tooltip.date).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className="text-amber-300">
            ${Number(tooltip.revenue || 0).toFixed(2)} revenue
          </div>
          <div className="text-slate-300">
            {tooltip.orders} order{tooltip.orders === 1 ? "" : "s"}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-amber-400" /> Revenue
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-slate-900 border-t border-dashed" /> Orders
          (peak {maxOrders})
        </span>
      </div>
    </div>
  );
}

// Horizontal bar list - used for top products and top categories.
export function BarList({ items, valueKey = "revenue", labelKey = "name", format }) {
  const max = Math.max(1, ...items.map((i) => Number(i[valueKey]) || 0));
  return (
    <ul className="space-y-2.5">
      {items.length === 0 && (
        <li className="text-xs text-slate-500 py-6 text-center">No data yet.</li>
      )}
      {items.map((it, idx) => {
        const v = Number(it[valueKey]) || 0;
        const pct = Math.round((v / max) * 100);
        return (
          <li key={idx}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-800 truncate max-w-[60%]">
                {it[labelKey] || "—"}
              </span>
              <span className="text-slate-600 font-medium">
                {format ? format(v, it) : v}
              </span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const STATUS_COLOR = {
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  refunded: "bg-amber-50 text-amber-700 border-amber-200",
  cod_pending: "bg-amber-50 text-amber-700 border-amber-200",
  cod_collected: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function StatusBreakdown({ data, title }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((acc, [, v]) => acc + v, 0);
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>
      {entries.length === 0 ? (
        <div className="text-xs text-slate-500 py-6 text-center">No data yet.</div>
      ) : (
        <ul className="space-y-2">
          {entries.map(([k, v]) => {
            const pct = total ? Math.round((v / total) * 100) : 0;
            return (
              <li key={k} className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                    STATUS_COLOR[k] || "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {k.replace(/_/g, " ")}
                </span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-600 w-12 text-right">
                  {v} ({pct}%)
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
