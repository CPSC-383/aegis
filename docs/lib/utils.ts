import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAssignment1(): boolean {
  const currentAssignment = process.env.NEXT_PUBLIC_CURRENT_ASSIGNMENT;

  return currentAssignment === "a1";
}
