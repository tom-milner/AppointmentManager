import axios from "axios";

// object to use for any api interactions
export default () => {
  return axios.create({
    baseURL: process.env.VUE_APP_API_URL
  })
}