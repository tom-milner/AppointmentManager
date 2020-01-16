const UserModel = require("../../models/MongooseModels/UserModels/UserModel");
const AppResponse = require("../../struct/AppResponse");
const AppointmentModel = require("../../models/MongooseModels/AppointmentModel");
const Logger = require("../../struct/Logger");

// takes array of user Ids an returns simple user object.
async function getReducedUsers(req, res) {
    const response = new AppResponse(res);

    // userIds is a string with comma seperated values
    try {
        let userIds = req.query.userIds.split(",").filter(Boolean);
        let users = [];
        for (id of userIds) {
            let user = await UserModel.findOne({
                    _id: id
                },
                "username firstname lastname"
            );
            if (user) users.push(user);
        }
        return response.success("Users returned successfully", {
            users: users
        });

    } catch (error) {
        Logger.error("Error getting usernames", err);
        return response.failure("Error getting usernames.", 500);
    }
}

// delete a user account
async function deleteUser(req, res) {
    const response = new AppResponse(res);
    try {
        let userId = req.params.userId;

        let deletedUser = await UserModel.findByIdAndDelete(userId);

        if (!deletedUser) return response.failure(
            "User not found",
            400
        );

        // TODO: make this an option OR demote user to guest account so their account will be deleted after the last appointment.
        // delete any future appointments of the user.
        await AppointmentModel.deleteMany({
            clients: deletedUser
        });


        return response.success("User deleted successfully", {
            user: deletedUser
        })

    } catch (error) {
        Logger.error("Error deleting user", error);
        return response.failure("Error deleting user.", 500)
    }
}

module.exports = {
    getReducedUsers,
    deleteUser
}