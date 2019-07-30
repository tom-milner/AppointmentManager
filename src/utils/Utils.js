// ascii to binary
function base64Decode(base64String) {
  return Buffer.from(base64String, "base64").toString("ascii");
}


function getUserFromAuthHeader(authHeader) {
  // deconstruct existing token to get user data
  const tokenPayload = authHeader.split(".")[1];
  const decodedTokenPayload = JSON.parse(base64Decode(tokenPayload));
  // create new token with user info
  let user = {
    id: decodedTokenPayload.id,
    username: decodedTokenPayload.username,
    email: decodedTokenPayload.email,
    role: decodedTokenPayload.role
  };
  return user;
}


module.exports = {
  base64Decode,
  getUserFromAuthHeader
}