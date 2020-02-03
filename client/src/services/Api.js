import axios from "axios";

import UserService from "./UserService";
console.log(UserService);

import AuthenticationService from "/Users/tommilner/Projects/AppointmentManager/client/src/services/AuthenticationService.js";

// The axios instance to use for all requests.
const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || `http://${window.document.location.hostname}:8081`,
  timeout: 30 * 1000 // 30s timeout
});

// Authorization interceptors
axiosInstance.interceptors.request.use(AuthenticationService.setupTokenRefresher);

// The first argument to this function is 'onFulfilled', a function to run when a successful request has been made.
// The second argument is 'onError' - a function to run when the request returns an error.
// We're  only interested in failed requests, so we supply the first function with 'undefined'.
axiosInstance.interceptors.response.use(undefined, AuthenticationService.setupAccessDeniedResponseInterceptor);

// Object to use for any api interactions
export default axiosInstance;
