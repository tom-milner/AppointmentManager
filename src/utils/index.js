// utility functions

export default {
  // TODO: annotate 
  convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

}