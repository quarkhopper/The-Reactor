# Image Button Alignment on Responsive Panel

**Date:** 2025-03-25  
**Component:** `ImageButton.tsx`  
**Author:** Reactor Project Team

## 🧩 Problem

We needed to overlay a glowing button image (`button_glow.png`) on top of a panel image (`panel_cutout.png`) in a React + Tailwind + Vite app. The goal was to:

- Maintain pixel-perfect alignment across screen sizes
- Preserve layering (button above panel)
- Allow responsive scaling with the browser window
- Enable toggling of button images (on/off states)

**Initial issues:**
- The button image appeared beside or below the panel instead of over it.
- On click, it sometimes broke layout entirely.
- Scaling the window caused misalignment.
- Using `require()` with Vite caused runtime crashes.

---

## 🔍 Root Causes

1. **Layout flow errors:** Images were not wrapped in a fixed container with proper relative positioning, so they flowed outside their intended bounds.
2. **Absolute positioning mismatch:** We used fixed pixel values (`top: 256px`), which broke alignment as the container scaled.
3. **Incorrect module usage:** `require()` was used in a TypeScript/Vite project, which led to a white screen crash.

---

## ✅ Final Solution

We fixed it with the following changes:

1. **Responsive Container**
   - Used a square `div` (`aspect-ratio: 1/1`) with a max width/height (`768px`).
   - Positioned this with Tailwind + inline CSS for precise layout.

2. **Layered Layout**
   - Made the container `position: relative`.
   - Used `position: absolute` for both panel and button images.
   - Ensured both fill the container with `width: 100%`, `height: 100%`, `object-fit: cover`.

3. **Percentage-Based Alignment**
   - Positioned and sized the button using `%` instead of `px`.
   - Tuned `top`, `left`, `width`, and `height` until visually aligned with the panel cutout.

4. **Correct Image Importing**
   - Replaced `require()` with ES module `import` statements for all images.

---

## 🧪 Results

- Button overlays cleanly on the panel at any screen size.
- Toggling between `button_on` and `button_off` works with click events.
- Layout remains stable with no browser resizing issues.
- Ready for next phase: reusable buttons on a large panel with drop shadow states.

---

## 📝 Future Notes

- Image-based prototyping is educational but time-intensive. For future layouts, use a **blank background panel** and layer interactive buttons freely with flexible positioning and shadow effects.
- Consider building a **debug mode** that shows button bounds and anchor points.

