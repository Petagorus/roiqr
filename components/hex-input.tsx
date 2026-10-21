"use client";

import * as React from "react";

import { normalizeHex } from "@/lib/color";

interface Props {
  /** Canonical current color (e.g. "#1f1a17"). */
  value: string;
  /** Called with a normalized hex whenever the typed text becomes valid. */
  onCommit: (hex: string) => void;
  label: string;
}

/**
 * Text input for hex colors. Lets the user type freely (including partial
 * values like "#7c3a") but only commits normalized values; on blur the field
 * snaps back to the last valid color so an invalid draft never sticks.
 */
export function HexInput({ value, onCommit, label }: Props) {
  const [raw, setRaw] = React.useState(value);
  const focusedRef = React.useRef(false);

  // Follow external changes (color picker, reset) while not editing.
  React.useEffect(() => {
    if (!focusedRef.current) setRaw(value);
  }, [value]);

  return (
    <input
      type="text"
      value={raw}
      onChange={(e) => {
        setRaw(e.target.value);
        const hex = normalizeHex(e.target.value);
        if (hex) onCommit(hex);
      }}
      onFocus={() => {
        focusedRef.current = true;
      }}
      onBlur={() => {
        focusedRef.current = false;
        setRaw(value);
      }}
      aria-label={label}
      spellCheck={false}
      maxLength={7}
      className="h-9 w-28 rounded-md border border-input px-2 text-sm font-medium uppercase"
      style={{ color: "#000" }}
    />
  );
}
