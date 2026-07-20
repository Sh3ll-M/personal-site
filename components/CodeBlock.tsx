"use client";

import { useEffect, useRef } from "react";

export function CodeBlock() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = markerRef.current?.previousElementSibling;
    if (!container) return;

    const figures = container.querySelectorAll<HTMLElement>(
      "figure[data-rehype-pretty-code-figure]"
    );
    const cleanups: Array<() => void> = [];

    figures.forEach((figure) => {
      const codeEl = figure.querySelector("code");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy-button";
      button.setAttribute("aria-label", "Copy code to clipboard");
      button.textContent = "Copy";

      let revertTimeout: ReturnType<typeof setTimeout> | undefined;
      const handleClick = async () => {
        const code = codeEl?.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = "Copied";
          revertTimeout = setTimeout(() => {
            button.textContent = "Copy";
          }, 1500);
        } catch {
          // Clipboard unavailable — silently no-op per design spec.
        }
      };

      button.addEventListener("click", handleClick);
      figure.appendChild(button);

      cleanups.push(() => {
        button.removeEventListener("click", handleClick);
        if (revertTimeout) clearTimeout(revertTimeout);
        button.remove();
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return <span ref={markerRef} hidden />;
}
