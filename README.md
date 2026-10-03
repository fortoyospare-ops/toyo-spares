# Toyo Spares website

Toyota & Ford parts, Fawkner, Melbourne. Plain Vite + React + Tailwind site, deployed on Vercel.
No Lovable, no database. Enquiry forms are emailed to the business via Resend.

## Deploy on Vercel

1. Push this folder to a GitHub repository.
2. In Vercel: Add New -> Project -> import the repository. Settings are detected automatically
   (Framework: Vite, build command `npm run build`, output `dist`). Do not change them.
3. Before or after the first deploy, add these under Settings -> Environment Variables
   (see `.env.example`):
   - `RESEND_API_KEY` (create a free account at resend.com, then API Keys)
   - `ENQUIRY_TO_EMAIL` (optional, default fortoyospare@gmail.com)
   - `ENQUIRY_FROM_EMAIL` (optional, leave default until you verify a domain in Resend)
4. Redeploy after adding variables. Test both forms on the live site and check the inbox.

Note: with Resend's default sender (`onboarding@resend.dev`) emails can only be delivered to the
email address the Resend account was registered with. Register Resend with fortoyospare@gmail.com.

## Replace the photos

`src/assets/toyo-hero.jpg` and `src/assets/toyo-parts-workshop.jpg` are placeholders.
Replace them with the real photos using the same file names.

## Local development

```sh
npm install
npm run dev          # site only; forms need the /api route, so use `npx vercel dev` to test them
npm run typecheck
npm run build
```

## Where things are

- `src/App.tsx` - all page content (hours, makes, services, FAQ, contact details)
- `src/styles.css` - colours and fonts
- `api/enquiry.ts` - receives the forms and sends the email
