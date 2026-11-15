import clsx from "clsx";
import { db } from "@/lib/db";
import { toggleMessage, deleteMessage } from "../actions";
import { PageHead, Flash, SubmitButton, ConfirmButton } from "@/components/admin/ui";

export default async function AdminMessages({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const messages = await db.contactMessage.findMany({ orderBy: [{ read: "asc" }, { createdAt: "desc" }], take: 200 });
  return (
    <div className="max-w-[900px]">
      <PageHead title="Messages" sub="From the contact form." />
      <Flash sp={sp} />
      {messages.length === 0 && <p className="text-fg-3">No messages yet.</p>}
      <ul className="space-y-3">
        {messages.map((m) => (
          <li key={m.id} className={clsx("rounded-[18px] border p-5", m.read ? "border-line" : "border-volt/50 bg-volt/5")}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">{m.name}{m.company && <span className="font-normal text-fg-2">, {m.company}</span>} <span className="ml-2 rounded-[18px] border border-line-2 px-1.5 py-0.5 text-xs font-normal text-fg-2">{m.topic}</span></p>
              <span className="text-xs text-fg-3">{m.createdAt.toLocaleString("en-IN")}</span>
            </div>
            <p className="mt-1 text-sm">
              <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: your message to Humynex (${m.topic})`)}`} className="text-volt-hi">{m.email}</a>
              {m.phone && <> / <a href={`tel:${m.phone}`} className="text-volt-hi">{m.phone}</a></>}
            </p>
            <p className="mt-3 whitespace-pre-line text-fg-2">{m.message}</p>
            <div className="mt-4 flex gap-2">
              <form action={toggleMessage}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="read" value={m.read ? "false" : "true"} />
                <SubmitButton>{m.read ? "Mark unread" : "Mark as read"}</SubmitButton>
              </form>
              <form action={deleteMessage}>
                <input type="hidden" name="id" value={m.id} />
                <ConfirmButton message="Delete this message permanently?">Delete</ConfirmButton>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
