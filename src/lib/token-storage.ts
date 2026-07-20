let accessToken: string | null = null;

export const tokenStorage = {
  getToken: () => accessToken,
  setToken: (token: string | null) => {
    accessToken = token;
  },
};
