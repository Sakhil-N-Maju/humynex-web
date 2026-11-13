import clsx from "clsx";

/** Label above, input in the middle, error below. Never placeholder-as-label. */
export function Field({
  label,
  name,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={clsx("flex flex-col", className)}>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-fg-3">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-bad" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
