// This creates a new guest account.
// This is middleware as opposed to a dedicated endpoint because guest users should only be created when a one off appointment is made.
async function createGuestUser() {

  // Get the user information

  // Using email as key, see if user already exists with that information.
  // If present, don't create new guest, forward on existing user.

  // Create new GuestModel

  // Set password to be impossible to hack 
  // GuestModel is a discriminator of UserModel, so has to have a password.
}


async function checkGuestsForUser() {
  // Called when registering a new user.

  // Sees if there is an exisiting guest with the current credentials
  // If so, elevates the guests account status

  // Else, creates a new client like normal
}


module.exports = {
  createGuestUser
}