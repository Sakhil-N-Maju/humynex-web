# Humynex Robotics website

Next.js 16 site for Humynex Robotics (Kalady, Kerala) with a parts shop, robot rentals,
instant 3D-print quoting, customer accounts with reward points, offers, and an admin
dashboard that controls the catalogue and site content.

## Run it locally

```bash
npm install
cp .env.example .env        # then fill AUTH_SECRET and SEED_ADMIN_PASSWORD
npm run db:setup            # creates prisma/dev.db and loads the seed catalogue
npm run dev                 # http://localhost:3000
```

Admin: sign in at `/login` with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `.env`.
You land on `/admin`.

Useful scripts: `npm run typecheck`, `npm run lint`, `npm run build`, `npm run db:studio`.

## What's in it

| Area | Route | Notes |
|---|---|---|
| Landing | `/` | Light hero with gear-letter headline, dock nav, screen-to-services scroll transition, trust bar, process, case studies, pricing, FAQ, lead form |
| Shop | `/shop`, `/shop/[slug]` | Categories, search, sort, stock, specs, JSON-LD product data |
| Cart + checkout | drawer, `/checkout` | Server-side pricing, coupons, pay-with-points, free shipping threshold |
| Rentals | `/rentals`, `/rentals/[slug]` | Availability calendar, multi-unit stock, deposit, coupon, operator included |
| 3D printing | `/print` | STL/OBJ upload, live 3D preview, instant quote; the server re-checks the price |
| Projects | `/projects`, `/projects/[slug]` | Case studies from the admin |
| About | `/about` | Vision, mission, stats, team, values |
| Offers | `/offers` | Public coupon codes and how rewards work |
| Account | `/signup`, `/login`, `/account` | 150-point welcome bonus, tiers, history, pay unpaid items |
| Contact | `/contact` | Saved to the admin inbox (with a spam honeypot) |
| Legal | `/privacy`, `/terms` | **Drafts. Have a lawyer review before launch.** |
| Admin | `/admin/*` | Orders, bookings, print jobs (file download), customers and points, messages, products, rental fleet, offers, projects, team, site copy, rewards, shipping and print pricing |

## Payments (Razorpay)

Payments use the Razorpay Orders API, Checkout and HMAC signature verification
(`src/lib/payments.ts`). A webhook at `/api/payments/webhook` covers customers who close
the tab before the browser confirms.

**Without keys**, checkout runs in a clearly labelled *test mode* so the whole flow can be
tried with no money taken. Test mode is refused automatically in production builds. It
cannot be switched on in production.

To go live:
1. Add `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (test keys first, then live).
2. In the Razorpay dashboard add a webhook: `https://<domain>/api/payments/webhook`,
   events `payment.captured`, `order.paid`, `payment.failed`. Put its secret in `RAZORPAY_WEBHOOK_SECRET`.
3. Refunds are issued from the Razorpay dashboard. Cancelling an order in admin returns
   the customer's points and restocks the items, but doesn't move money.

## Rewards

1 point = ₹1. Defaults: 150 points on signup, 5 points per ₹100 paid (parts, rent and
prints, never deposits), up to 20% of an order payable in points. Tiers: Spark, Circuit
(1,500 lifetime), Core (6,000). All of these numbers are editable in
**Admin > Content & settings > Rewards**, except the tier thresholds (`src/lib/tiers.ts`).

## Before launch: content the client must supply

- [ ] **Prices.** Product and rental prices are realistic placeholders (the old site listed a LiDAR at ₹450). Confirm each one in admin.
- [ ] **Team.** Six placeholder cards ("Profile coming soon"). Add real names and photos. Placeholders hide automatically once one real profile exists.
- [ ] **Photography.** No product, rental or project photos exist yet. Upload them per item in admin. Until then the site shows designed "catalogue plates". See `HIGGSFIELD-IMAGE-BRIEF.md`.
- [ ] **Project write-ups.** Drafted from the old site's project list. Confirm the facts.
- [ ] **Stats.** 3+ years, 25+ engineers and 8 patents pending come from the old site. Confirm they're accurate.
- [ ] **Domain vs email.** The site is `humynexrobotics.in` but email is `@humynex.com`. Pick the canonical one.
- [ ] **Social links.** Add them in admin; the footer shows only the ones that are filled in.
- [ ] **Legal pages.** Review `/privacy` and `/terms`.
- [ ] **"Bumblebee" name.** Bumblebee is a Hasbro (Transformers) character. Consider listing it as a generic "yellow robot costume" to avoid trademark trouble.
- [ ] **Trust bar.** Add real client logos and certifications under `clients` / `badges` in settings; the rows stay hidden while empty. Testimonials work the same way.

## Deploying (Vercel)

The local setup writes to disk; Vercel's filesystem is read-only. Three swaps:
1. **Database.** In `prisma/schema.prisma` set `provider = "postgresql"` and point `DATABASE_URL` at Neon, Supabase or Vercel Postgres. Run `npx prisma db push` then `npm run db:seed`.
2. **Admin image uploads.** Replace the body of `saveImage()` in `src/lib/uploads.ts` with Vercel Blob, S3 or Cloudinary. It's the only function that writes images.
3. **3D print files.** `src/app/actions/print.ts` and `src/app/api/admin/print-file/[id]/route.ts` read and write `storage/prints`. Move them to private object storage (a private Blob store or S3 bucket).

Set `NEXT_PUBLIC_SITE_URL` to the real domain (used for canonical URLs and the sitemap).

## Not built yet

- **Transactional email.** Order, booking and print confirmations aren't emailed; the team follows up manually from admin. Resend or Postmark would slot in after `fulfilPayment()`.
- **Password reset.** Customers can't reset a forgotten password yet. This needs email.
- **Shipping integration and GST invoices.** Status is updated by hand in admin.

## Design notes

- **Type:** Inter Display (Inter at optical size 32). SemiBold for headings, Regular/Medium for body. JetBrains Mono for prices.
- **Landing hero:** white and navy (#050816) only. Every "o" in the headline is drawn as a gear (`src/components/landing/gear-heading.tsx`) that turns slowly with scroll.
- **Dock nav** (`src/components/landing/dock.tsx`): transparent pill, logo centred as the home link, sections split either side, dock-style magnification. It reads the `data-theme` of whatever is underneath and switches between navy and white.
- **Screen transition** (`src/components/landing/stage.tsx`): a navy panel sits in the bottom quarter of the hero; scrolling grows it (clip-path) to fill the viewport and reveals the services, flipping the page from light to dark. Phones get a stacked version.
- **Inner pages** (shop, rentals, print, account, admin) still use the earlier dark design and header; they'll be brought in line with the landing page next.
- **Motion:** Lenis smooth scroll, Motion for scroll-linked and UI animation. Everything honours `prefers-reduced-motion`.
