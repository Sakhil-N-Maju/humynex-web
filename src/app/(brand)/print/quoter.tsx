"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileArrowUp, Lock, Warning, X } from "@phosphor-icons/react";
import clsx from "clsx";
import { analyzeMesh, MAX_UPLOAD_BYTES, MeshError, type MeshStats } from "@/lib/mesh";
import { estimatePrint, type PrintConfig } from "@/lib/print-pricing";
import { createPrintJob } from "@/app/actions/print";
import { usePendingModel } from "@/components/print/pending-file";
import { usePayment } from "@/components/pay/use-payment";
import { Field } from "@/components/ui/field";
import { toast } from "@/components/ui/toaster";
import { formatINR } from "@/lib/money";

const MeshPreview = dynamic(() => import("@/components/print/mesh-preview").then((m) => m.MeshPreview), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center"><span className="label animate-pulse">Rendering</span></div>,
});

type Mat = { code: string; name: string; description: string; density: number; pricePerG: number; colors: string[] };
type U = { name: string; email: string; phone: string } | null;
type Cfg = PrintConfig & { turnaround: string };

const INFILLS = [10, 15, 20, 30, 50, 75, 100];

export function Quoter({ materials, cfg, user }: { materials: Mat[]; cfg: Cfg; user: U }) {
  const pending = usePendingModel();
  const [file, setFile] = useState<File | null>(null);
  const [stats, setStats] = useState<MeshStats | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [over, setOver] = useState(false);

  const [matCode, setMatCode] = useState(materials[0]?.code ?? "PLA");
  const mat = materials.find((m) => m.code === matCode) ?? materials[0];
  const [color, setColor] = useState(mat?.colors[0] ?? "Black");
  const [infill, setInfill] = useState(20);
  const [quality, setQuality] = useState("STANDARD");
  const [qty, setQty] = useState(1);
  const [units, setUnits] = useState<"mm" | "in">("mm");
  const [form, setForm] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", notes: "", coupon: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState<string | null>(null);
  const { pay, busy, dialog } = usePayment();

  const load = async (f: File | null | undefined) => {
    if (!f) return;
    setParseError(null);
    setStats(null);
    setReview(null);
    if (f.size > MAX_UPLOAD_BYTES) return setParseError("That file is over 60 MB. Email it to us and we'll quote it by hand.");
    setFile(f);
    setParsing(true);
    try {
      const buf = await f.arrayBuffer();
      const s = analyzeMesh(f.name, buf);
      setStats(s);
      // a part under 4 mm across is almost always an inch file
      const maxDim = Math.max(s.size.x, s.size.y, s.size.z);
      setUnits(maxDim < 4 ? "in" : "mm");
    } catch (e) {
      setParseError(e instanceof MeshError ? e.message : "We couldn't read that model. Try exporting it again as STL.");
      setFile(null);
    } finally {
      setParsing(false);
    }
  };

  // pick up a model dropped on the home page
  useEffect(() => {
    const f = pending.file;
    if (!f) return;
    pending.set(null);
    queueMicrotask(() => load(f));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // the chosen colour falls back to the material's first colour if it isn't offered
  const activeColor = mat?.colors.includes(color) ? color : (mat?.colors[0] ?? color);

  const scale = units === "in" ? 25.4 : 1;
  const size = useMemo(
    () => (stats ? { x: stats.size.x * scale, y: stats.size.y * scale, z: stats.size.z * scale } : null),
    [stats, scale],
  );
  const quote = useMemo(() => {
    if (!stats || !mat || !size) return null;
    return estimatePrint({ volumeMm3: stats.volume * scale ** 3, size, material: mat, infill, quality, quantity: qty }, cfg);
  }, [stats, mat, size, scale, infill, quality, qty, cfg]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: k === "coupon" ? e.target.value.toUpperCase() : e.target.value }));
    if (errors[k]) setErrors((e) => Object.fromEntries(Object.entries(e).filter(([key]) => key !== k)));
  };

  const submit = async () => {
    if (!file || !quote) return;
    setSaving(true);
    const fd = new FormData();
    fd.set("file", file);
    Object.entries({ material: matCode, color: activeColor, infill, quality, quantity: qty, units, ...form }).forEach(([k, v]) => fd.set(k, String(v)));
    const res = await createPrintJob(fd);
    setSaving(false);
    if (!res.ok) {
      if (res.fieldErrors) setErrors(res.fieldErrors);
      toast.bad(res.error ?? "Check the highlighted fields.");
      return;
    }
    if (!res.payable) {
      setReview("Your part is larger than our print bed, or very small, so an engineer will check it and call you with a confirmed price. Nothing to pay yet.");
      return;
    }
    await pay("PRINT", res.jobId);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
      {/* left: drop zone / preview */}
      <div>
        <label
          htmlFor="model"
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            load(e.dataTransfer.files?.[0]);
          }}
          className={clsx(
            "relative block aspect-[4/3] overflow-hidden rounded-[28px] border bg-ink-2 transition-colors",
            stats ? "border-line" : "cursor-pointer border-dashed",
            over ? "border-volt-hi bg-volt/10" : "border-line-2",
          )}
        >
          <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
          {stats ? (
            <MeshPreview positions={stats.positions} color={activeColor} bed={cfg.bed} />
          ) : (
            <div className="relative flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <FileArrowUp size={44} weight="light" className="text-volt-hi" />
              <span className="display text-2xl">{parsing ? "Reading your model" : over ? "Release to load" : "Drop an STL or OBJ"}</span>
              <span className="text-sm text-fg-2">or click to choose. Up to 60 MB. Files stay private.</span>
            </div>
          )}
          <input id="model" type="file" accept=".stl,.obj" className="sr-only" onChange={(e) => load(e.target.files?.[0])} disabled={!!stats} />
        </label>
        {parseError && <p className="mt-3 text-sm text-bad" role="alert">{parseError}</p>}

        {stats && size && file && (
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="max-w-[260px] truncate text-fg">{file.name}</span>
            <span className="font-mono text-fg-2">
              {size.x.toFixed(1)} x {size.y.toFixed(1)} x {size.z.toFixed(1)} mm
            </span>
            <span className="font-mono text-fg-2">{((stats.volume * scale ** 3) / 1000).toFixed(2)} cm³</span>
            <div className="ml-auto flex items-center gap-3">
              <div className="flex overflow-hidden rounded-full border border-line-2" role="radiogroup" aria-label="File units">
                {(["mm", "in"] as const).map((u) => (
                  <button key={u} type="button" role="radio" aria-checked={units === u} onClick={() => setUnits(u)} className={clsx("px-3 py-1 font-mono text-xs", units === u ? "bg-volt text-ink" : "text-fg-2 hover:text-fg")}>
                    {u}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  setStats(null);
                  setFile(null);
                  setReview(null);
                }}
                className="flex items-center gap-1 text-fg-3 hover:text-fg"
              >
                <X size={14} /> Change file
              </button>
            </div>
          </div>
        )}
        {quote && !quote.fitsBed && (
          <p className="mt-4 flex gap-2 rounded-[16px] border border-warn/40 bg-warn/10 p-3 text-sm text-warn">
            <Warning size={18} className="shrink-0" /> This part is bigger than our {cfg.bed.x} x {cfg.bed.y} x {cfg.bed.z} mm bed. Submit it and we&apos;ll quote splitting it into pieces.
          </p>
        )}
      </div>

      {/* right: options + price */}
      <div className="h-fit rounded-[28px] border border-white/10 bg-ink-2 p-6 md:p-8 lg:sticky lg:top-28">
        <fieldset>
          <legend className="text-sm font-semibold">Material</legend>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {materials.map((m) => (
              <button
                key={m.code}
                type="button"
                onClick={() => setMatCode(m.code)}
                aria-pressed={m.code === matCode}
                className={clsx("rounded-[14px] border p-3 text-left transition-colors", m.code === matCode ? "border-volt bg-volt/10" : "border-line-2 hover:border-volt/60")}
              >
                <span className="block text-sm font-semibold">{m.name}</span>
                <span className="font-mono text-xs text-fg-3">{formatINR(m.pricePerG, true)}/g</span>
              </button>
            ))}
          </div>
          {mat && <p className="mt-3 text-sm text-fg-2">{mat.description}</p>}
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">Colour</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {mat?.colors.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)} aria-pressed={c === activeColor} className={clsx("rounded-full border px-3 py-1.5 text-sm", c === activeColor ? "border-volt bg-volt/10 text-fg" : "border-line-2 text-fg-2 hover:text-fg")}>
                {c}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">Finish</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {Object.entries(cfg.qualities).map(([k, q]) => (
              <button key={k} type="button" onClick={() => setQuality(k)} aria-pressed={k === quality} className={clsx("rounded-[14px] border p-2.5 text-left", k === quality ? "border-volt bg-volt/10" : "border-line-2 hover:border-volt/60")}>
                <span className="block text-sm font-semibold">{q.label}</span>
                <span className="block font-mono text-xs text-fg-3">{q.layer} mm</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-fg-3">{cfg.qualities[quality]?.note}</p>
        </fieldset>

        <div className="mt-6 grid grid-cols-[1fr_auto] items-end gap-4">
          <div>
            <label htmlFor="infill" className="flex justify-between text-sm font-semibold">
              Infill <span className="font-mono font-normal text-fg-2">{infill}%</span>
            </label>
            <input id="infill" type="range" min={0} max={INFILLS.length - 1} step={1} value={INFILLS.indexOf(infill)} onChange={(e) => setInfill(INFILLS[Number(e.target.value)])} className="mt-3 w-full accent-[#1e90ff]" />
            <div className="mt-1 flex justify-between text-[0.7rem] text-fg-3"><span>Light</span><span>Solid</span></div>
          </div>
          <div>
            <label htmlFor="pqty" className="text-sm font-semibold">Qty</label>
            <input id="pqty" type="number" min={1} max={50} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} className="input mt-2 h-10 w-20 font-mono" />
          </div>
        </div>

        <div className="mt-6 border-t border-line pt-5" aria-live="polite">
          {quote ? (
            <>
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-fg-2">Material, about {Math.round(quote.grams * qty)} g</dt><dd className="font-mono">{formatINR(quote.materialCost)}</dd></div>
                <div className="flex justify-between"><dt className="text-fg-2">Machine time, about {(quote.hours * qty).toFixed(1)} h</dt><dd className="font-mono">{formatINR(quote.machineCost)}</dd></div>
                <div className="flex justify-between"><dt className="text-fg-2">Setup</dt><dd className="font-mono">{formatINR(quote.setupFee)}</dd></div>
                {quote.minApplied && <div className="flex justify-between text-fg-3"><dt>Minimum job</dt><dd className="font-mono">{formatINR(cfg.minOrder)}</dd></div>}
              </dl>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="font-semibold">Estimate</span>
                <AnimatePresence mode="popLayout">
                  <motion.span key={quote.total} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} className="font-mono text-3xl">
                    {formatINR(quote.total)}
                  </motion.span>
                </AnimatePresence>
              </div>
            </>
          ) : (
            <p className="text-sm text-fg-3">Load a model to see the price.</p>
          )}
        </div>

        {quote && !review && (
          <form
            className="mt-6 space-y-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" name="pname" error={errors.name}><input id="pname" value={form.name} onChange={set("name")} className="input" autoComplete="name" aria-invalid={!!errors.name} /></Field>
              <Field label="Phone" name="pphone" error={errors.phone}><input id="pphone" value={form.phone} onChange={set("phone")} type="tel" className="input" autoComplete="tel" aria-invalid={!!errors.phone} /></Field>
            </div>
            <Field label="Email" name="pemail" error={errors.email}><input id="pemail" value={form.email} onChange={set("email")} type="email" className="input" autoComplete="email" aria-invalid={!!errors.email} /></Field>
            <Field label="Notes for the printer (optional)" name="pnotes"><textarea id="pnotes" rows={2} value={form.notes} onChange={set("notes")} className="input" /></Field>
            <Field label="Offer code (optional)" name="pcoupon"><input id="pcoupon" value={form.coupon} onChange={set("coupon")} className="input font-mono uppercase" /></Field>
            <button className="btn btn-primary w-full" disabled={saving || busy}>
              <Lock size={16} /> {saving ? "Uploading model" : busy ? "Opening payment" : quote.fitsBed ? `Pay ${formatINR(quote.total)} and print` : "Send for a manual quote"}
            </button>
            <p className="text-xs text-fg-3">Estimate is final for parts that fit the bed. Ready in {cfg.turnaround.toLowerCase()}.</p>
          </form>
        )}
        {review && <p className="mt-6 rounded-[16px] border border-line-2 bg-ink p-4 text-sm text-fg-2">{review}</p>}
      </div>
      {dialog}
    </div>
  );
}
