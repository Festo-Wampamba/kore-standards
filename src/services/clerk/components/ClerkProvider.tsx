"use client";

import { ClerkProvider as OriginalClerkProvider } from "@clerk/nextjs";
import { ReactNode, useEffect, useState } from "react";
import { dark } from "@clerk/themes";

export function ClerkProvider({ children }: { children: ReactNode }) {
  // Use 'use client' component pattern - always start with false for SSR consistency
  // This prevents hydration mismatch by ensuring server and client render the same initially
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Mark as mounted and check dark mode only on client
    setMounted(true);
    
    const updateDarkMode = () => {
      setIsDarkMode(document.body.classList.contains("dark"));
    };
    
    // Run initial check
    updateDarkMode();

    // Watch for changes to the dark class
    const observer = new MutationObserver(updateDarkMode);

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <OriginalClerkProvider
      appearance={mounted && isDarkMode ? { baseTheme: [dark] } : undefined}
    >
      {children}
    </OriginalClerkProvider>
  );
}
