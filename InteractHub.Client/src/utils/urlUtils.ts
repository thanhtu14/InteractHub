const SERVER_BASE_URL = "https://localhost:7069";

export const resolveUrl = (path?: string | null): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${SERVER_BASE_URL}${path}`;
};