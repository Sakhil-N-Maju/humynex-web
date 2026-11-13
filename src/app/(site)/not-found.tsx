import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[1000px] flex-col items-start gap-8 px-4 py-24 md:flex-row md:items-center md:px-8">
      <div>
        <p className="font-mono text-fg-3">404</p>
        <h1 className="display-wide mt-2 text-4xl md:text-5xl">This part isn&apos;t in stock.</h1>
        <p className="mt-3 max-w-[44ch] text-fg-2">The page you were looking for doesn&apos;t exist or has moved.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">Back to home</Link>
          <Link href="/shop" className="btn btn-ghost">Browse parts</Link>
        </div>
      </div>
    </div>
  );
}
