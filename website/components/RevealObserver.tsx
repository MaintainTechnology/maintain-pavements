"use client";

import { useEffect } from "react";

/** Marks [data-reveal] elements with data-in as they enter the viewport, once each.
 *  CSS does the motion, and hides elements only when scripting is on and motion is allowed.
 *  Render it last inside each page, not in the layout: segments hydrate separately, and an
 *  observer in the layout can mark page elements before React hydrates them (a mismatch). */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-in", "");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll("[data-reveal]:not([data-in])").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
