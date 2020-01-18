import axios from "axios";
import AuthenticationService from "@/services/AuthenticationService";


const axiosInstance = axios.create({
    baseURL: process.env.VUE_APP_API_URL || `http://${window.document.location.hostname}:8081`,
    timeout: 30 * 1000 // 30s timeout
});

// TODO: make sure user is connected to the internet before making request.
// authorization interceptors
axiosInstance.interceptors.request.use(AuthenticationService.setupTokenRefresher);

// The first argument to this function is 'onFulfilled', a function to run when a successful request has been made.
// The second argument is 'onError' - a function to run when the request returns an error.
// We're  only interested in failed requests, so we supply the first function with 'undefined'.
axiosInstance.interceptors.response.use(undefined, AuthenticationService.setupAccessDeniedResponseInterceptor);


// object to use for any api interactions
export default axiosInstance;