const isChromeExtension =
  typeof chrome !== "undefined" &&
  !!chrome.storage?.local;

export const storage = {
  async get<T>(key: string, fallback: T): Promise<T> {
  if (isChromeExtension) {
    return new Promise<T>((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve((result[key] as T) ?? fallback);
      });
    });
  }

  // web fallback
  const raw = localStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : fallback;
},

  async set<T>(key: string, value: T): Promise<void> {
    if (isChromeExtension) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => resolve());
      });
    }

    localStorage.setItem(key, JSON.stringify(value));
  },
};
