# Ties & Tails — Responsive E-commerce Storefront

A warm, editorial-style pet-shop website built with **React 19, Vite 6, Tailwind CSS 4, and Lucide icons**. It is designed for desktop, tablet, and mobile and is configured for **Vercel**.

All product and lifestyle photos included in `public/images/` were cropped from the brand promotional images provided for this project.

## What is included

- Responsive home page with the Ties & Tails look and feel
- Four category collections: cat litter, feeding bowls, stainless-steel litter boxes, pet wipes
- 11 editable product listings, including lavender, lemon, apple, and coffee bentonite litter
- Search, filtering, and sorting
- Product-details dialog, sizes, quantities, and sample price variations
- Wishlist and shopping bag persisted in the browser via `localStorage`
- Cart drawer, subtotal calculation, and checkout inquiry form
- **Copy order inquiry** action to contact the shop (not a live order submission)
- Keyboard Escape closes dialogs, mobile navigation, accessible button labels
- Local photos, brand artwork, responsive layouts, favicon, and share image

**Important:** This is a fully interactive *front-end demonstration*, not a production-ready commerce backend. The sample prices are made up purely for layout and UI testing. There is no inventory database, order management system, real checkout, payment provider, or authenticated user account. Do **not** accept real money or customer orders until these are configured and tested.

## Start locally

Install [Node.js](https://nodejs.org/) **20.19+ or 22.12+**, then run in the extracted project folder:

```bash
npm install
npm run dev
```

Open the URL Vite prints, commonly `http://localhost:5173`.

To create a production build:

```bash
npm run build
npm run preview
```

Build output goes into `dist/`.

## Deploy on Vercel

1. Create a GitHub repository and push this project (do not commit `node_modules`).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel should detect **Vite** automatically. If entering settings manually use:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Deploy. The included `vercel.json` also provides these settings.

A successful deploy is a **public preview of the storefront UI**, not a functioning live payment checkout.

## How to customize

| Change | File |
|---|---|
| Product descriptions, categories, sizes, example prices | `src/data.js` |
| Website text, hero, collection layout, cart and checkout | `src/App.jsx` |
| Peach/forest-green styling, mobile layout | `src/index.css` |
| Brand pictures | `public/images/` |
| Website title, description, social share image | `index.html` |
| Vercel configuration | `vercel.json` |

All product photos are packaging reference images. Add official, high-resolution product photos before launching. Official pack sizes, stock, real prices, shipping rules, product claims, and social links should all be confirmed with the store owner.

## Before taking real orders

You will need to integrate a real backend/data service such as **Supabase, Firebase, or a custom API**; persistent products and inventory; order management; secure checkout using a supported payment gateway (for example PayMongo if suitable for your merchant setup); delivery rates; customer authentication if accounts are desired; and legal policies such as privacy, shipping, returns, and refunds.

Do **not** store payment card details in your own browser code. Let a regulated payment provider handle them.

The Instagram button points to `https://www.instagram.com/tiesandtails.ph/`, based on the handle in the supplied material. The Facebook page is deliberately **not linked** because its official URL wasn't supplied.

## Design preview file

`design-preview.html` is an optional, **noninteractive static mockup** for visual inspection only. The actual working React version is `src/App.jsx` and launches with `npm run dev`.

---
Built as a responsive concept storefront for Ties & Tails.
