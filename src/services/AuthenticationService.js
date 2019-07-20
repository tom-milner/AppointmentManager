import Api from "@/services/Api.js";
import Axios from "axios";

// Helper functions
function storeToken(token) {
  localStorage.setItem("token", token);
  Axios.defaults.headers.common["Authorization"] = token;
}

function removeToken() {
  localStorage.removeItem("token");
}

export default {
  // Login user
  async loginUser(username, password) {
    // Send post request to login route
    console.log(username, password);
    try {
      const result = await Api().post("/auth/login", {
        username: username,
        password: password
      });
      console.log(result.data);
      // store token in axios headers and local storage.
      storeToken(result.data.token);
      return result.data;
    } catch (err) {
      console.log(err.response.data);
      // invalid token - remove it from storage
      removeToken();
      throw err.response.data;
    }
  },

  // Register User
  async registerUser(user) {
    try {
      // Send post request to register route
      const result = await Api().post("/auth/register", user);
      storeToken(result.data.token);
      return result.data;
    } catch (err) {
      console.log(err.response);
      throw err.response.data;
    }
  }
};
