
import axios from "axios";

const BASE_URL = (
  import.meta.env.API_URL ||
  "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access") ||
      sessionStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const adminDashboardApi = {
  getDashboard: () => api.get("/admin/dashboard/"),
};



export const adminUsersApi = {
  getUsers: (params = {}) =>
    api.get("/admin/users/", { params }),

  getStats: () =>
    api.get("/admin/users/stats/"),

  getUser: (id) =>
    api.get(`/admin/users/${id}/`),

  updateUser: (id, data) =>
    api.patch(`/admin/users/${id}/update/`, data),

  updateStatus: (id, is_active) =>
    api.patch(`/admin/users/${id}/update/`, {
      is_active,
    }),

  updateRole: (id, role) =>
    api.patch(`/admin/users/${id}/update/`, {
      role,
    }),
};



export const adminJobsApi = {
  getJobs: (params = {}) =>
    api.get("/admin/jobs/", { params }),

  getStats: () =>
    api.get("/admin/jobs/stats/"),

  getJob: (id) =>
    api.get(`/admin/jobs/${id}/`),

  updateJob: (id, data) =>
    api.patch(`/admin/jobs/${id}/update/`, data),

  updateStatus: (id, is_active) =>
    api.patch(`/admin/jobs/${id}/update/`, {
      is_active,
    }),

  deleteJob: (id) =>
    api.delete(`/admin/jobs/${id}/delete/`),
};




export const adminCompaniesApi = {
  getCompanies: (params = {}) =>
    api.get("/admin/companies/", { params }),

  getStats: () =>
    api.get("/admin/companies/stats/"),

  getCompany: (id) =>
    api.get(`/admin/companies/${id}/`),

  updateCompany: (id, data) =>
    api.patch(`/admin/companies/${id}/update/`, data),

  updateStatus: (id, is_active) =>
    api.patch(`/admin/companies/${id}/update/`, {
      is_active,
    }),

  updateVerification: (id, is_verified) =>
    api.patch(`/admin/companies/${id}/update/`, {
      is_verified,
    }),
};




export default api;
