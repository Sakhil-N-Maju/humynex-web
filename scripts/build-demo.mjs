// UI-only demo build: create a seeded SQLite file, then build the site with it.
// Used on Vercel (see vercel.json) so no database or env setup is needed.
import { execSync } from "node:child_process";

process.env.DATABASE_URL ||= "file:./demo.db";
// opens /admin without sign-in and makes its saves a no-op with a notice
process.env.NEXT_PUBLIC_DEMO_MODE = "1";
const run = (cmd) => execSync(cmd, { stdio: "inherit", env: process.env });

run("npx prisma db push --skip-generate");
run("node --import tsx prisma/seed.ts");
run("npx next build");
