import axios from "axios";
import AuthenticationService from "@/services/AuthenticationService";


const axiosInstance = axios.create({
    baseURL: process.env.VUE_APP_API_URL || `http://${window.document.location.hostname}:8081`,
    timeout: 30 * 1000 // 30s timeout
});

// authorization interceptors
axiosInstance.interceptors.request.use(AuthenticationService.setupTokenRefresher);

axiosInstance.interceptors.response.use(undefined, AuthenticationService.setupAccessDeniedResponseInterceptor);
// object to use for any api interactions

export default axiosInstance;