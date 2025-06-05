import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateEmail(email: string): boolean {
  return email.endsWith('@schools.nyc.gov');
}

export function formatDate(dateString: string): string {
  // Convert strings like "June 18th" to a more readable format
  return dateString;
}

export function formatTime(timeString: string): string {
  // Convert strings like "5pm" to a more readable format
  return timeString;
}

export function formatLocation(location: string): string {
  // Clean up location formatting
  return location.replace(/\n/g, ', ');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
