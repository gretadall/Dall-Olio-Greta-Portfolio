"use client";

import { createContext, useContext, useState, useSyncExternalStore } from "react";

type EditModeContextValue = {
  isAdmin: boolean;
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  colorPanelOpen: boolean;
  setColorPanelOpen: (value: boolean) => void;
};

const EditModeContext = createContext<EditModeContextValue | null>(null);

const STORAGE_KEY = "beyondcv:edit-mode";

function subscribeNoop() {
  return () => {};
}

function readPersistedEditMode() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function readServerEditMode() {
  return false;
}

export function EditModeProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  // Reads sessionStorage without causing a hydration mismatch: React uses
  // readServerEditMode for both the server render and the first client
  // render, then swaps to the real value right after.
  const persisted = useSyncExternalStore(
    subscribeNoop,
    readPersistedEditMode,
    readServerEditMode
  );
  const [override, setOverride] = useState<boolean | null>(null);
  const [colorPanelOpen, setColorPanelOpen] = useState(false);
  const editModeState = override ?? persisted;

  function setEditMode(value: boolean) {
    setOverride(value);
    if (!value) setColorPanelOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      // sessionStorage unavailable (private mode etc.) — edit mode just won't persist across pages.
    }
  }

  return (
    <EditModeContext.Provider
      value={{
        isAdmin,
        editMode: isAdmin && editModeState,
        setEditMode,
        colorPanelOpen,
        setColorPanelOpen,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    return {
      isAdmin: false,
      editMode: false,
      setEditMode: () => {},
      colorPanelOpen: false,
      setColorPanelOpen: () => {},
    };
  }
  return ctx;
}
