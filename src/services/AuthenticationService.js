import Api from "@/services/Api.js";

export default {

  // Try to login user
  loginUser(username, password) {
    return Api().post("/auth/login", {
      username: username,
      password: password
    }).then((result) => {
      console.log(result.data);
      return result.data;

    }).catch((err) => {
      console.log(err.response.data);
      return err.response.data;
    });

  }
}