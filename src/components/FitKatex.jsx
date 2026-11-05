import { useLayoutEffect, useRef } from "react";

function topKatexNodes(root) {
  return [...root.querySelectorAll(".katex")].filter(
    (el) => !el.parentElement?.classList.contains("katex")
  );
}

export default function FitKatex({ children, className = "" }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const fit = () => {
      topKatexNodes(root).forEach((el) => {
        const display = el.parentElement?.classList.contains("katex-display")
          ? el.parentElement
          : null;
        el.style.transform = "";
        el.style.marginBottom = "";
        if (display) display.style.height = "";
        const avail = (display || root).clientWidth;
        const need = el.scrollWidth;
        if (!(avail > 0 && need > avail + 1)) return;
        const scale = avail / need;
        el.style.transformOrigin = "left top";
        el.style.transform = `scale(${scale})`;
        if (display) {
          display.style.height = `${el.offsetHeight * scale}px`;
        } else {
          el.style.marginBottom = `${el.offsetHeight * (scale - 1)}px`;
        }
      });
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(root);
    return () => observer.disconnect();
  });

  return (
    <div ref={ref} className={`fit-katex ${className}`.trim()}>
      {children}
    </div>
  );
}
