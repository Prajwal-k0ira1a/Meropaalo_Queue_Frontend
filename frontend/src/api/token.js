import apiClient from "./apiClient";

/**
 * Token and Queue related Endpoints
 */
const tokenApi = {
  // Get all tokens
  getAllTokens: () => apiClient.get("/tokens"),

  // Issue a new token
  issueToken: (tokenData) => apiClient.post("/tokens/issue", tokenData),

  // Get status of a specific token
  getTokenStatus: (tokenId) => apiClient.get(`/tokens/${tokenId}/status`),
};

export default tokenApi;
