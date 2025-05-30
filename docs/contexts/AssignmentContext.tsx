"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Assignment = "pathfinding" | "mas";

interface AssignmentContextType {
  assignment: Assignment;
  setAssignment: (assignment: Assignment) => void;
  isPathfinding: boolean;
  isMas: boolean;
  toggleAssignment: () => void;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export function AssignmentProvider({ children }: { children: ReactNode }) {
  const [assignment, setAssignmentState] = useState<Assignment>("pathfinding");

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("assignment") as Assignment | null;
    if (stored === "pathfinding" || stored === "mas") {
      setAssignmentState(stored);
    }
  }, []);

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("assignment", assignment);
  }, [assignment]);

  const setAssignment = (newAssignment: Assignment) => {
    setAssignmentState(newAssignment);
  };

  const isPathfinding = assignment === "pathfinding";
  const isMas = assignment === "mas";

  const toggleAssignment = () => {
    setAssignmentState((prev) => (prev === "pathfinding" ? "mas" : "pathfinding"));
  };

  return (
    <AssignmentContext.Provider
      value={{
        assignment,
        setAssignment,
        isPathfinding,
        isMas,
        toggleAssignment,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
}

export function useAssignment() {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error("useAssignment must be used within an AssignmentProvider");
  }
  return context;
}
