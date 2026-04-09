import { GeneratedContent } from "../types";

const STORAGE_KEY = 'linky_history';

export const getHistory = (): GeneratedContent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const addToHistory = (item: GeneratedContent) => {
  try {
    const current = getHistory();
    // Prevent duplicates if re-adding same ID
    const filtered = current.filter(i => i.id !== item.id);
    // Add to top
    const updated = [item, ...filtered].slice(0, 50); // Limit to 50 items
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save history", e);
  }
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};