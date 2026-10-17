# Premium Meat

Modern, responsive meat-commerce website built with plain HTML, CSS, JavaScript and Bootstrap.

> **Portfolio concept.** Premium Meat is a fictional brand concept created to demonstrate modern food-business design and frontend development. Product details, prices, contact information and operating claims are sample content; replace them with verified business information before launch.

## Brand & design
Brand: **Premium Meat** (fresh halal meat, ordered online). Logo: `images/logo.svg`. The shared visual system and responsive page styling live in `css/style.css`.

## Features
- Responsive design (phone, tablet, laptop, desktop) with an animated mobile menu
- Product catalogue drawn from ONE master list (`js/data.js`)
- Category filters + live search that work together, with a result counter and empty states
- Product Quick View (weight 250 g / 500 g / 1 kg, quantity, live total)
- Shopping cart saved in `localStorage` and shared across every page
- Checkout form with validation, free-delivery progress bar and WhatsApp order message
- Bulk quote calculator with discount tiers
- Gallery with filters and a full-screen lightbox (next / previous / ESC / swipe)
- Sample bundle cards, with prices calculated from the product list
- Accessibility: skip link, visible focus, labelled forms, alt text, keyboard-friendly controls

## Technologies
HTML5 | CSS3 | JavaScript (ES5, no build step) | Bootstrap 5 | Bootstrap Icons | GitHub Pages

## Project structure
```
index.html  about.html  products.html  order.html
services.html  facilities.html  gallery.html  contact.html
css/style.css            design system + all styles (commented)
js/config.js             settings (WhatsApp number, delivery rules) + helpers
js/data.js               MASTER product + price list  <-- edit prices here
js/render.js             builds product cards / deals from data.js
js/ui.js                 navbar, scroll effects, toasts, counters
js/cart.js               addToCart(), removeFromCart(), updateQuantity(), calculateTotal()
js/products.js           filterProducts(), searchProducts(), Quick View
js/checkout.js           validateForm(), generateOrder(), sendToWhatsApp()
js/calculator.js         bulk quote calculator
js/gallery.js            filterGallery(), openLightbox(), nextImage(), previousImage()
js/main.js               contact form and WhatsApp links
images/                  photos (compress to under ~300 KB, WebP where possible)
```

## How to change things
- **A price / badge / description:** edit the product in `js/data.js`. Home, Products, Quick View, Order and Deals all update.
- **WhatsApp order number:** `WHATSAPP_NUMBER` at the top of `js/config.js` (currently 0304 8335259 = `923048335259`). The phone/WhatsApp text in the page footer and Contact page is in the page HTML.
- **Free delivery rule / delivery fee:** `FREE_DELIVERY_OVER` and `DELIVERY_FEE` in `js/config.js`.
- **Colours:** the design tokens in `css/style.css`.
- **Hero image:** `images/home/hero-image.jpg` (preloaded on the home page).

## Speed (why the pages open quickly)
- No loading screen: the page is visible immediately
- Scripts use `defer`, so they never block the first paint
- One hero image (preloaded on the home page), no loading screen, no simulated order notifications
- Two fonts only (Playfair Display + Inter) with `display=swap`
- Images are lazy-loaded; **compress your photos to ~150-300 KB (WebP if possible)** - this is the biggest speed win you control
- Scroll effects run once per animation frame

## Honesty notes
Product information, prices and business details are illustrative. Orders are sent as a WhatsApp message; the site does not process payments or store orders. Cart prices are always taken from `js/data.js` (never from the browser's stored data), but a real shop must also verify prices on a server.

## Live demo
Add your GitHub Pages link here.

## Screenshots
Add 4-6 screenshots here (home, products, quick view, cart/order, gallery lightbox, mobile).
