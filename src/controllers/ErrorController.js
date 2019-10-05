// Global error handling function
function sendError(res, errorMessage, errorCode, returnObject) {

  // log any internal server errors.
  if (errorCode == 500) {
    console.log(errorMessage);
  }

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