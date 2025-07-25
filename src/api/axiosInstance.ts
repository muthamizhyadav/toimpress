import axios from "axios";
import { API_URL } from "./api";

// Step-1: Create a new Axios instance with a custom config.
// The timeout is set to 10s. If the request takes longer than
// that, the request will be aborted.

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
});

// Step-2: Create request, response & error handlers
const requestHandler = (request:any) => {
  request.headers["Access-Control-Allow-Origin"] = "*";
  request.headers.accesstoken = localStorage.getItem("token");
  return request;
};

const responseHandler = (response:any) => {
  return response;
};

const errorHandler = (error:any) => {
  return Promise.reject(error); // Properly reject the error
};

// Step-3: Configure request & response interceptors
axiosInstance.interceptors.request.use(
  (request:any) => requestHandler(request),
  (error:any) => errorHandler(error)
);

axiosInstance.interceptors.response.use(
  (response:any) => responseHandler(response),
  (error:any) => errorHandler(error)
);

export default axiosInstance;
