let accessToken: string | null = null;
const listeners = new Set<(token: string | null) => void>();

export const tokenStorage = {
  getToken: () => accessToken,
  setToken: (token: string | null) => {
    accessToken = token;
    listeners.forEach((cb) => cb(token));
  },
  subscribe: (cb: (token: string | null) => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};
