import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${formatTime(d)}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${formatTime(d)}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago, ${formatTime(d)}`;
  } else {
    return formatDate(d);
  }
}

export function getMoodEmoji(mood: string): string {
  const moodMap: Record<string, string> = {
    "very-happy": "😄",
    "happy": "😊",
    "neutral": "😐",
    "sad": "😔",
    "anxious": "😰",
    "excited": "🤩",
    "tired": "😴",
  };
  return moodMap[mood] || "😐";
}

export function getMoodScore(mood: string): number {
  const scoreMap: Record<string, number> = {
    "very-happy": 10,
    "happy": 8,
    "excited": 9,
    "neutral": 5,
    "tired": 4,
    "sad": 3,
    "anxious": 2,
  };
  return scoreMap[mood] || 5;
}
