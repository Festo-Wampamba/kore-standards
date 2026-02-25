"use client"

import { ReactNode, useEffect, useState } from "react"

export function IsBreakpoint({
  breakpoint,
  children,
  otherwise = null,
}: {
  breakpoint: string;
  children: ReactNode;
  otherwise?: ReactNode;
}) {
  const isBreakpointActive = useIsBreakpoint(breakpoint);
  return isBreakpointActive ? children : otherwise;
}

function useIsBreakpoint(breakpoint: string) {
  const [isBreakpoint, setIsBreakpoint] = useState(false);

  useEffect(() => {
    const mediaQuery = breakpoint.startsWith("(") ? breakpoint : `(${breakpoint})`;
    const media = window.matchMedia(mediaQuery);
    const controller = new AbortController();

    // The update function
    const onChange = () => setIsBreakpoint(media.matches);

    // Call it immediately to set initial state (fixes the cascading render warning!)
    onChange();

    // Listen for window resizes
    media.addEventListener("change", onChange, { signal: controller.signal });

    return () => {
      controller.abort();
    };
  }, [breakpoint]);

  return isBreakpoint;
}