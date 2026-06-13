"use client";

import { useEffect, useState } from "react";

export default function DebugInputWatcher() {
  const [last, setLast] = useState<string>("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      setLast((s) => `Key: ${e.key} | target=${(e.target as any)?.tagName || "?"} id=${(e.target as any)?.id || "-"}`);
      console.debug("DebugInputWatcher keydown", e.key, e);
    };
    const onInput = (e: Event) => {
      setLast((s) => `Input event on ${(e.target as any)?.tagName || "?"} id=${(e.target as any)?.id || "-"}`);
      console.debug("DebugInputWatcher input", e);
    };
    const onFocusIn = (e: FocusEvent) => {
      setLast((s) => `FocusIn ${(e.target as any)?.tagName || "?"} id=${(e.target as any)?.id || "-"}`);
      console.debug("DebugInputWatcher focusin", e);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("input", onInput, true);
    window.addEventListener("focusin", onFocusIn, true);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("input", onInput, true);
      window.removeEventListener("focusin", onFocusIn, true);
    };
  }, []);

  // Small overlay so the user can see events visually
  return (
    <div style={{ position: "fixed", right: 8, bottom: 8, zIndex: 9999 }}>
      <div style={{ background: "rgba(0,0,0,0.6)", color: "#fff", padding: "6px 10px", borderRadius: 8, fontSize: 12, fontFamily: "monospace" }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>Input Debug</div>
        <div>{last}</div>
      </div>
    </div>
  );
}
