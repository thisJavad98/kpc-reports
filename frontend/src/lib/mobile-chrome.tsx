"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ChromeState = {
  title: string;
  action: React.ReactNode | null;
};

type MobileChromeContextValue = {
  title: string;
  action: React.ReactNode | null;
  setChrome: (next: Partial<ChromeState>) => void;
};

const MobileChromeContext = createContext<MobileChromeContextValue | null>(
  null,
);

export function MobileChromeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [title, setTitle] = useState("KPC");
  const [action, setAction] = useState<React.ReactNode | null>(null);

  const setChrome = useCallback((next: Partial<ChromeState>) => {
    if (next.title !== undefined) setTitle(next.title);
    if (next.action !== undefined) setAction(next.action);
  }, []);

  const value = useMemo(
    () => ({ title, action, setChrome }),
    [title, action, setChrome],
  );

  return (
    <MobileChromeContext.Provider value={value}>
      {children}
    </MobileChromeContext.Provider>
  );
}

export function useMobileChrome() {
  const ctx = useContext(MobileChromeContext);
  if (!ctx) {
    throw new Error("useMobileChrome must be used within MobileChromeProvider");
  }
  return ctx;
}

/** Sets the mobile top-bar title and optional single action for this screen. */
export function useSetMobileChrome(
  title: string,
  action: React.ReactNode | null = null,
) {
  const { setChrome } = useMobileChrome();

  useEffect(() => {
    setChrome({ title, action });
    return () => setChrome({ title: "KPC", action: null });
  }, [title, action, setChrome]);
}
