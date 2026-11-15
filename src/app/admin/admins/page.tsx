import { Trash, GoogleLogo } from "@phosphor-icons/react/dist/ssr";
import { adminEmails, ADMIN_PREVIEW } from "@/lib/admin-access";
import { getSetting } from "@/lib/settings";
import { addAdmin, removeAdmin } from "../actions";
import { PageHead, Flash, F, Card, SubmitButton, ConfirmButton } from "@/components/admin/ui";

export default async function AdminAdmins({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [all, stored] = await Promise.all([adminEmails(), getSetting("admins")]);
  const fromEnv = all.filter((e) => !stored.includes(e));

  return (
    <div className="max-w-[760px] space-y-8">
      <PageHead
        eyebrow="Settings · Access"
        title="Admins"
        sub="People who can open this admin. They sign in with the Google account for these addresses."
      />
      <Flash sp={sp} />

      {ADMIN_PREVIEW && (
        <p className="rounded-[20px] bg-[#1E90FF]/[0.07] px-5 py-4 text-sm leading-relaxed text-fg-2">
          <span className="font-medium text-fg">Sign-in is switched off for now.</span> This list is saved and decides who gets in once
          Google sign-in is connected.
        </p>
      )}

      <Card title="Add an admin">
        <form action={addAdmin} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <F label="Google account email" name="email" className="flex-1">
            <input id="email" name="email" type="email" required placeholder="name@gmail.com" className="input" autoComplete="off" />
          </F>
          <SubmitButton>Add admin</SubmitButton>
        </form>
      </Card>

      <Card title={`Current admins (${all.length})`}>
        {all.length === 0 ? (
          <p className="text-sm text-fg-3">No admins yet. Add the first Google account above.</p>
        ) : (
          <ul className="divide-y divide-line rounded-[18px] border border-line">
            {all.map((email) => (
              <li key={email} className="flex items-center gap-4 px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink-2">
                  <GoogleLogo size={18} weight="bold" />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{email}</span>
                {fromEnv.includes(email) ? (
                  <span className="text-xs text-fg-3" title="Set in the ADMIN_EMAILS environment variable">Set by server</span>
                ) : (
                  <form action={removeAdmin}>
                    <input type="hidden" name="email" value={email} />
                    <ConfirmButton message={`Remove ${email} as an admin?`}>
                      <Trash size={14} /> Remove
                    </ConfirmButton>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
