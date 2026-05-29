import apiClient from "../../api/apiClient";

export const staffApi = {
  getCounters: (departmentId) =>
    apiClient.get("/counters", { params: { department: departmentId } }),

  getTokens: (departmentId, status) =>
    apiClient.get("/tokens", { params: { department: departmentId, status } }),

  serveNext: (departmentId, counterId) =>
    apiClient.post("/tokens/serve-next", { department: departmentId, counterId }),

  callToken: (tokenId, counterId) =>
    apiClient.patch(`/tokens/${tokenId}/call`, { counterId }),

  serveToken: (tokenId, counterId) =>
    apiClient.patch(`/tokens/${tokenId}/serve`, { counterId }),

  completeToken: (tokenId, counterId) =>
    apiClient.patch(`/tokens/${tokenId}/complete`, { counterId }),

  getQueueDays: (departmentId) =>
    apiClient.get("/queue-days", { params: { department: departmentId } }),

  openQueueDay: (departmentId, date, startTime = "09:00", endTime = "17:00") =>
    apiClient.post("/queue-days/open", {
      department: departmentId,
      date,
      startTime,
      endTime,
    }),

  closeQueueDay: (queueDayId) =>
    apiClient.patch(`/queue-days/${queueDayId}/close`),

  resetQueueDay: (queueDayId) =>
    apiClient.post(`/queue-days/${queueDayId}/reset`),
};
