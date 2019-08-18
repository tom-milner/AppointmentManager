// utility functions

export default {
  // convert rem value into pixels
  convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  },

  // function to check if object is empty
  objIsEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) return false;
    }
    return true;
  },

  // get user object from jwt token
  getUserFromToken(token) {
    let parts = token.split(".");
    let decoded = atob(parts[1]);
    return JSON.parse(decoded);
  }

}