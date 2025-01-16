import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAssignment1(): boolean {
  const currentAssignment = process.env.NEXT_PUBLIC_CURRENT_ASSIGNMENT;

  return currentAssignment === "a1";
}

export const getImagePath = (path: string): string => {
  const basePath = process.env.NODE_ENV === "production" ? "/aegis" : "";
  return `${basePath}${path}`;
};
