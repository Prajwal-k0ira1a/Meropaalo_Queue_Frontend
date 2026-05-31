import { authApi } from "../api";

export const authService = {
  async login(email, password, department) {
    const response = await authApi.login({
      email,
      password,
      ...(department ? { department } : {}),
    });

    if (response?.user || response?.next) {
      return response;
    }

    if (response?.data?.user || response?.data?.next) {
      return response.data;
    }

    throw new Error("Invalid response structure from login API");
  },

  async register(name, email, password) {
    const response = await authApi.register({ name, email, password });
    console.log("Register API Response:", response);

    // Handle different response structures
    if (response?.user) {
      return response.user;
    } else if (response) {
      return response;
    }

    throw new Error("Invalid response structure from register API");
  },

  async logout() {
    return authApi.logout();
  },

  async forgotPassword(email) {
    return authApi.forgotPassword(email);
  },
};
