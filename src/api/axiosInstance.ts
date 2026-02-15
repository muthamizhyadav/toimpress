import axios from "axios";
import { API_URL } from "./api";
import { store } from "../redux/store";
import { logout } from "../redux/features/authSlice";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const requestHandler = (request: any) => {
  const token = localStorage.getItem("token");
  if (token) {
    request.headers.authorization = `Bearer ${token}`;
  }
  return request;
};

const errorHandler = (error: any) => {
  if (error.response?.status === 401) {
    store.dispatch(logout());
    window.location.replace("/account");
  }

  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(
  requestHandler,
  errorHandler
);

axiosInstance.interceptors.response.use(
  (response) => response,
  errorHandler
);

export default axiosInstance;
