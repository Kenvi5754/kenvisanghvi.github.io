# Revamped Portfolio — Kenvi Sanghvi

A completely rebuilt single-page portfolio with a warm light theme, heavy scroll animations, and a custom-generated hero illustration.

## How to view

Open `index.html` in a browser, or run a simple server from the repo root:

```
cd /path/to/kenvisanghvi.github.io
python3 -m http.server 8000
```

Then visit: **http://localhost:8000/Revamped_Portfolio/**

## Structure

- **index.html** — Hero, scrolling marquee, Work (filterable grid), About, Resume (timeline), Testimonials, Connect (CTA).
- **styles.css** — Warm cream palette, Playfair Display + Inter fonts, floating shapes, animated components, responsive.
- **script.js** — GSAP + ScrollTrigger animations, Lenis smooth scroll, split-text reveals, staggered card entrances, parallax, animated counters, magnetic buttons, custom cursor, header hide/show.
- **hero-illustration.png** — Generated illustration of a designer at her desk.

All images are loaded from `../assets/`. Portfolio links go to existing `portfolio-details-*.html` pages in the parent directory.
