"use client";

import Link from "next/link";
import { ArrowUpRight, Cpu, Dog, GraduationCap, Printer, Robot } from "@phosphor-icons/react";
import clsx from "clsx";
import ScrollStack, { ScrollStackItem } from "./scroll-stack/ScrollStack";

export type Service = {
  key: "custom" | "lab" | "parts" | "rentals" | "print";
  title: string;
  line: string;
  points: string[];
  bestFor: string;
  href: string;
  cta: string;
};

const ICONS = { custom: Robot, lab: GraduationCap, parts: Cpu, rentals: Dog, print: Printer };

/** Every service as a card that pins and stacks while the page scrolls. */
export function ServiceStack({ services }: { services: Service[] }) {
  return (
    <ScrollStack
      useWindowScroll
      smoothScroll={false} // Lenis already smooths the page
      stackPosition="16%"
      itemDistance={110}
      itemStackDistance={22}
      itemScale={0.035}
      baseScale={0.88}
      dimAmount={0.28}
      holdDistance={140}
      className="mx-auto max-w-[1240px]"
    >
      {services.map((s, i) => {
        const Icon = ICONS[s.key];
        return (
          <ScrollStackItem
            key={s.key}
            theme="light"
            itemClassName={clsx(
              "!h-auto !p-6 md:!min-h-[22rem] md:!p-10",
              "!bg-white !text-[#050816]",
            )}
          >
            <article id={`service-${s.key}`} className="grid h-full scroll-mt-32 gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
              <div className="flex flex-col">
                <div className="flex items-center gap-4">
                  <span className={clsx("font-mono text-sm", "text-[#050816]/45")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Icon size={30} weight="light" className="text-[#1E90FF]" aria-hidden="true" />
                </div>
                <h3 className="display mt-6 text-3xl md:text-[2.6rem]">{s.title}</h3>
                <p className={clsx("mt-3 max-w-[38ch] text-lg", "text-[#050816]/70")}>{s.line}</p>
                <Link
                  href={s.href}
                  className={clsx(
                    "mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-full px-6 font-semibold transition-colors md:mt-auto",
                    "bg-[#1E90FF] text-white hover:bg-[#1A7FE6]",
                  )}
                >
                  {s.cta} <ArrowUpRight size={16} weight="bold" />
                </Link>
              </div>
              <div className="flex flex-col justify-between gap-6 md:border-l md:pl-12" style={{ borderColor: "rgb(5 8 22 / 0.12)" }}>
                <ul className="space-y-3">
                  {s.points.map((p) => (
                    <li key={p} className="flex gap-3 text-[1.02rem]">
                      <span
                        className={clsx("mt-[0.55em] size-1.5 shrink-0 rounded-full", "bg-[#1E90FF]")}
                        aria-hidden="true"
                      />
                      <span className="text-[#050816]/85">{p}</span>
                    </li>
                  ))}
                </ul>
                <p className={clsx("text-sm", "text-[#050816]/60")}>
                  <span className="font-medium text-[#050816]">Best for:</span> {s.bestFor}
                </p>
              </div>
            </article>
          </ScrollStackItem>
        );
      })}
    </ScrollStack>
  );
}
