// utility functions

// import libs
import moment from "moment";

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
  },

  getNumberOfDayInWeek(dayName) {
    switch (dayName) {
      case "Monday":
        return 1;
      case "Tuesday":
        return 2;
      case "Wednesday":
        return 3;
      case "Thursday":
        return 4;
      case "Friday":
        return 5;
      case "Saturday":
        return 6;
      case "Sunday":
        return 0;
    }
  },

  // This function creates a moment object on the same day as another, but with a different time.
  getMomentFromTimeString(originalMoment, time) {
    let parts = time.split(":");
    let hours = parts[0];
    let minutes = parts[1];
    let newMoment = moment(originalMoment).startOf("day");
    // edit moment, changing hours and minutes
    return newMoment.hours(hours).minutes(minutes);
  }


}