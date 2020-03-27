/*
*   This file imports the base URL of the API from a configuration file and sets up the request interceptors.
*   Interceptors are functions to be run either before or after a request is made.
*   All the request interceptors are stored in AuthenticationService.js as they all have to do with authentication.
*   Every other service must make requests to the API through this file, so that the requests are all standardised.
*/

import axios from "axios";
import AuthenticationService from "@/services/AuthenticationService";


// The axios instance to use for all requests.
const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_API_URL || `http://${window.document.location.hostname}:8081`,
  timeout: 30 * 1000, // 30s timeout

});

// Authorization interceptors
axiosInstance.interceptors.request.use(AuthenticationService.setupTokenRefresher);

// The first argument to this function is 'onFulfilled', a function to run when a successful request has been made.
// The second argument is 'onError' - a function to run when the request returns an error.
// We're  only interested in failed requests, so we supply the first function with 'undefined'.
axiosInstance.interceptors.response.use(undefined, AuthenticationService.setupAccessDeniedResponseInterceptor);

// Object to use for any api interactions
export default axiosInstance;
