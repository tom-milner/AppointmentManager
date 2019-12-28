const mongoose = require("mongoose");

const UserModel = require("./UserModel");
const Role = require("../../Role");

const clientSchema = new mongoose.Schema({

    clinicalNotes: {
        type: String,
        select: false
    }
})

UserModel.discriminator("Client", clientSchema);


module.exports = mongoose.model("Client", clientSchema);