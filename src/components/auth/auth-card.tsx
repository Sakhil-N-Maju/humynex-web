import Image from "next/image";
import { GearPair } from "./auth-decor";

/**
 * The sign-in / sign-up card: one white card split in two. Brand on the left
 * (logo, name and a line, centred), the form on the right. Meshing gears
 * turn in the bottom corners.
 */
export function AuthCard({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="relative px-5 pb-16 pt-14 sm:px-10 md:px-16 md:pb-24 md:pt-20">
      {/* soft discs behind the card corners */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[8%] top-6 size-24 rounded-full bg-white/90 md:size-32" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-8 right-[7%] size-24 rounded-full bg-[#1E90FF]/80 md:size-36" />

      <div
        data-theme="light"
        className="admin-light relative mx-auto grid max-w-[980px] overflow-hidden rounded-[28px] bg-white text-[#050816] shadow-[0_40px_120px_-40px_rgba(30,144,255,0.5)] md:rounded-[36px] lg:grid-cols-2"
      >
        {/* brand side */}
        <div className="relative flex min-h-[260px] items-center justify-center px-8 py-14 text-center md:px-12 lg:min-h-[580px] lg:border-r lg:border-[#050816]/[0.07]">
          <div className="relative z-10">
            <Image src="/brand/logo-mark-160.webp" alt="" width={84} height={55} className="mx-auto" />
            <p className="display-wide mt-6 text-[2.3rem] md:text-[2.9rem]">Humynex Robotics</p>
            <p className="mx-auto mt-4 max-w-[32ch] text-lg text-[#050816]/60">
              Build it, rent it, print it. Your account keeps every order, booking and reward point in one place.
            </p>
          </div>
          <GearPair angle={-35} className="pointer-events-none absolute -bottom-10 -left-8 hidden w-[170px] opacity-95 md:w-[200px] lg:block" />
        </div>

        {/* form side */}
        <div className="relative flex flex-col justify-center px-6 pb-32 pt-14 sm:px-10 md:px-12 lg:pb-28 lg:pt-20">
          <div className="relative mx-auto w-full max-w-[380px]">
            <h1 className="display-wide text-center text-[3rem] text-[#1E90FF] md:text-[3.6rem]">{title}</h1>
            <p className="mt-2 text-center text-[#050816]/55">{sub}</p>
            <div className="mt-9">{children}</div>
          </div>

          <GearPair angle={-145} className="pointer-events-none absolute -bottom-10 -right-8 w-[150px] md:w-[180px]" />
        </div>
      </div>
    </div>
  );
}
