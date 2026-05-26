export default function PlaceholderPage({ title, description, phase }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="bg-white border border-dashed border-slate-300 rounded-lg p-10 text-center">
        <div className="inline-flex w-12 h-12 rounded-full bg-slate-100 items-center justify-center mb-3">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-500"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-base font-medium text-slate-800">Coming in {phase}</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          This section is wired up for routing and access control, but the management UI lands in a
          later phase.
        </p>
      </div>
    </div>
  );
}
