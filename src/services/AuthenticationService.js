import Api from "@/services/Api.js";
import Axios from "axios";

export default {

  // Login user
  loginUser(username, password) {
    return new Promise((resolve, reject) => {
      // Send post request to login route
      console.log(username, password);
      return Api().post("/auth/login", {
        username: username,
        password: password
      }).then((result) => {
        console.log(result.data);
        // store token in axios headers and local storage.
        const token = result.data.token;
        localStorage.setItem("token", token);
        Axios.defaults.headers.common["Authorization"] = token;
        resolve(result.data);
      }).catch((err) => {
        console.log(err.response.data);
        // remove token from storage - it must've expired
        localStorage.removeItem("token");
        reject(err.response.data);
      });
    });


  },

  // Register User
  registerUser(user) {
    // Send post request to register route
    return Api().post("/auth/register", user)
      .then(function (res) {
        console.log(res.data);
        return res.data;
      })
      .catch(function (err) {
        console.log(err);
        return err.response.data;
      });
  }
}