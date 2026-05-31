import apiClient from "../../api/apiClient";

export const adminApi = {
  getDepartments: () => apiClient.get("/departments"),

  createDepartment: (payload) => apiClient.post("/departments", payload),

  updateDepartment: (departmentId, payload) =>
    apiClient.patch(`/departments/${departmentId}`, payload),

  deleteDepartment: (departmentId) =>
    apiClient.delete(`/departments/${departmentId}`),

  getDashboard: (departmentId) =>
    apiClient.get("/admin/dashboard", { params: { department: departmentId } }),

  getTokens: (departmentId) =>
    apiClient.get("/tokens", { params: { department: departmentId } }),

  getCounters: (departmentId) =>
    apiClient.get("/counters", { params: { department: departmentId } }),

  createCounter: (_unusedInstitutionId, payload) =>
    apiClient.post("/counters", payload),

  updateCounter: (counterId, _unusedInstitutionId, payload) =>
    apiClient.patch(`/counters/${counterId}`, payload),

  assignCounterStaff: (counterId, _unusedInstitutionId, staffId) =>
    apiClient.patch(`/counters/${counterId}/assign-staff`, { staffId }),

  getUsers: (role) => apiClient.get("/users", { params: { role } }),

  updateUser: (userId, payload) =>
    apiClient.patch(`/users/${userId}`, payload),

  assignUserRole: (userId, role) =>
    apiClient.patch(`/users/${userId}/role`, { role }),

  assignUserDepartment: (userId, departmentId) =>
    apiClient.patch(`/users/${userId}/department`, { departmentId: departmentId || null }),

  getQueueDays: (departmentId) =>
    apiClient.get("/queue-days", { params: { department: departmentId } }),

  openQueueDay: (_unusedInstitutionId, departmentId, date, startTime = "09:00", endTime = "17:00") =>
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

  serveNext: (departmentId, counterId, _unusedInstitutionId) =>
    apiClient.post("/tokens/serve-next", { department: departmentId, counterId }),
};
