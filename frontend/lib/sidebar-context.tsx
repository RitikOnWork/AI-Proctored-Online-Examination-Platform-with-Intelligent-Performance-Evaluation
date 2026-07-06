"use client";

import React, { useState, createContext, useContext } from "react";

type SidebarContextType = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activeSection: string;
  setActiveSection: (v: string) => void;
};

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => {},
  activeSection: "dashboard",
  setActiveSection: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, activeSection, setActiveSection }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
