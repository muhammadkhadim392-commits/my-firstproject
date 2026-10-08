# Premium Slaughter House

Modern, responsive meat-commerce website built with plain HTML, CSS, JavaScript and Bootstrap.

> **Portfolio demo.** Premium Slaughter House is a concept created to demonstrate modern food-business web design and functionality. Prices, offers and the live-order notifications are sample content.

## Features
- Responsive design (phone, tablet, laptop, desktop) with an animated mobile menu
- Product catalogue drawn from ONE master list (`js/data.js`)
- Category filters + live search that work together, with a result counter and empty states
- Product Quick View (weight 250 g / 500 g / 1 kg, quantity, live total)
- Shopping cart saved in `localStorage` and shared across every page
- Checkout form with validation, free-delivery progress bar and WhatsApp order message
- Bulk quote calculator with discount tiers
- Gallery with filters and a full-screen lightbox (next / previous / ESC / swipe)
- Deal cards with a working countdown (resets at midnight)
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
js/main.js               contact form, deal popup, countdown()
images/                  photos (compress to under ~300 KB, WebP where possible)
```

## How to change things
- **A price / badge / description:** edit the product in `js/data.js`. Home, Products, Quick View, Order and Deals all update.
- **WhatsApp number:** `WHATSAPP_NUMBER` at the top of `js/config.js`.
- **Free delivery rule / delivery fee:** `FREE_DELIVERY_OVER` and `DELIVERY_FEE` in `js/config.js`.
- **Colours:** the `:root` block at the top of `css/style.css`.

## Live demo
Add your GitHub Pages link here.

## Screenshots
Add 4-6 screenshots here (home, products, quick view, cart/order, gallery lightbox, mobile).
