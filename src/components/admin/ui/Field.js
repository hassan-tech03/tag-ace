// Small, presentational form primitives so every admin page renders the same way.

export function Field({ label, htmlFor, hint, error, required, children, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

const baseInput =
  "w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500";

export function Input(props) {
  return <input {...props} className={`${baseInput} ${props.className || ""}`} />;
}

export function Textarea(props) {
  return (
    <textarea
      rows={4}
      {...props}
      className={`${baseInput} resize-y ${props.className || ""}`}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${baseInput} ${props.className || ""}`}>
      {children}
    </select>
  );
}

export function Checkbox({ label, checked, onChange, name, disabled }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
      <input
        type="checkbox"
        name={name}
        checked={!!checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
      />
      {label}
    </label>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400",
    secondary:
      "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-60",
    danger:
      "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  };
  const sizes = {
    sm: "px-2.5 py-1.5 text-xs",
    md: "px-3.5 py-2 text-sm",
    lg: "px-4 py-2.5 text-sm",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium disabled:cursor-not-allowed transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}
