import { saveSettingsSection } from "@/app/admin/actions";
import { Card, SubmitButton } from "./ui";

/** One settings section as a card with its own Save button. */
export function SettingsForm({
  section,
  back,
  title,
  sub,
  children,
}: {
  section: string;
  back: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <Card id={section} title={title} sub={sub}>
      <form action={saveSettingsSection} className="space-y-5">
        <input type="hidden" name="section" value={section} />
        <input type="hidden" name="back" value={back} />
        {children}
        <div className="pt-1">
          <SubmitButton>Save {title.toLowerCase()}</SubmitButton>
        </div>
      </form>
    </Card>
  );
}
