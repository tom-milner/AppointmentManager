/*
    This file contains the different user access levels (roles).
    This file is required by file that needs to perform role-based functions.
    This means that there is a single source of truth for the Role levels.
*/

module.exports = {
    GUEST: 0,
    CLIENT: 1,
    COUNSELLOR: 2,
    ADMIN: 3
}