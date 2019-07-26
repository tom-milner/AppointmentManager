// ascii to binary
function base64Decode(base64String) {
  return Buffer.from(base64String, "base64").toString("ascii");
}


module.exports = {
  base64Decode
}