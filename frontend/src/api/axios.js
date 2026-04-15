import axios from "axios";

// ✅ Dynamic base URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  withCredentials: true, // REQUIRED for HTTP-only cookies
});

// ===============================
// 🔁 Refresh token handling
// ===============================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // ✅ Handle 401 (except login/refresh)
    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/refresh") &&
      !original.url?.includes("/auth/login")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => API(original))
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        // 🔁 Attempt refresh
        await API.post("/auth/refresh");

        processQueue(null);

        return API(original);
      } catch (refreshErr) {
        processQueue(refreshErr);

        // 🚨 Hard redirect on failure
        window.location.href = "/login";

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;