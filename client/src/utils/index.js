// Utility functions

import moment from "moment";

export default {
  // function to check if object is empty
  objIsEmpty(obj) {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) return false;
    }
    return true;
  },

  // get user object from jwt token
  getTokenPayload(token) {
    let parts = token.split(".");
    let decoded = atob(parts[1]);
    return JSON.parse(decoded);
  },

  // Return the number of a given day in the week.
  getNumberOfDayInWeek(dayName) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(dayName);
  },

  // This function creates a moment object on the same day as another, but with a different time.
  // e.g. Turns '07:00' into a moment object of the same time on a specified day.
  getMomentFromTimeString(originalMoment, time) {
    let parts = time.split(":");
    let hours = parts[0];
    let minutes = parts[1];
    let newMoment = moment(originalMoment).startOf("day");
    // edit moment, changing hours and minutes
    return newMoment.hours(hours).minutes(minutes);
  },

  // Check if a value is a string.
  isString(value) {
    return Object.prototype.toString.call(value) == "[object String]";
  },

  // Copy a string to the clipboard
  copyToClipboard(value, document) {
    const input = document.createElement("input");
    input.value = value;

    // Set the input to be invisible.
    input.style.opacity = 0;
    input.style.height = "1rem";
    input.style.width = "1rem";

    //  Add the text to the page.
    document.body.appendChild(input);
    input.focus();
    input.select();
    // Copy the text.
    let success = document.execCommand("copy");
    document.body.removeChild(input);
    return success;
  }
};
