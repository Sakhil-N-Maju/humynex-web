"use client";

/** Sort dropdown that applies itself as soon as it changes, so the filter bar needs no Apply button. */
export function SortSelect({ value, options }: { value: string; options: [string, string][] }) {
  return (
    <select
      name="sort"
      defaultValue={value}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="input h-11 !rounded-full sm:w-auto"
    >
      {options.map(([k, label]) => (
        <option key={k} value={k}>
          {label}
        </option>
      ))}
    </select>
  );
}
