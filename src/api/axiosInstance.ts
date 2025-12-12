import axios from "axios";
import { API_URL } from "./api";
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const requestHandler = (request:any) => {
  request.headers["Access-Control-Allow-Origin"] = "*";
  
  request.headers.authorization = `Bearer ${localStorage.getItem("token")}`;
  return request;
};

const responseHandler = (response:any) => {
  return response;
};

const errorHandler = (error:any) => {
  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(
  (request:any) => requestHandler(request),
  (error:any) => errorHandler(error)
);

axiosInstance.interceptors.response.use(
  (response:any) => responseHandler(response),
  (error:any) => errorHandler(error)
);

export default axiosInstance;
