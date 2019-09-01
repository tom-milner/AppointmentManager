import axios from "axios";
import AuthenticationService from "@/services/AuthenticationService";


const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL,
});

// set headers
axiosInstance.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";


// authorization interceptors
axiosInstance.interceptors.request.use(AuthenticationService.setupTokenRefresher);

axiosInstance.interceptors.response.use(undefined, AuthenticationService.setupAccessDeniedResponseInterceptor);
// object to use for any api interactions

export default axiosInstance;