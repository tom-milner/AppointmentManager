// Global error handling function
function sendError(res, errorMessage, errorCode, returnObject) {

  // If errorCode is not in the range of http response codes, reset it.
  if (errorCode > 598) {
    errorCode = 500;
  }

  res.status(errorCode || 500).send({
    success: false,
    message: errorMessage || "Server error.",
    returnObject
  });
}


module.exports = {
  sendError
}