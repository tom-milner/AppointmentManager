const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

function jwtSignUser(user) {
  console.log(user)
  const ONE_WEEK = 60 * 60 * 24 * 7;
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: ONE_WEEK
  });
}



// sign up a new user
async function register(req, res) {
  const SALT_ROUNDS = 10;
  // create user
  let newUser = new UserModel({
    email: req.body.email,
    username: req.body.username,
  });
  // create password hash
  bcrypt.hash(req.body.password, SALT_ROUNDS, function (err, hash) {
    if (err) {
      res.json({
        error: "Error adding user."
      });
      return;
    }
    newUser.password = hash;
    newUser.save(function (err, newUser) {
      if (err) {
        let errorMessage;
        switch (err.code) {
          case 11000:
            errorMessage = "User already exists.";
            break;
          default:
            errorMessage = "Error creating user."
            break;
        }
        res.status(400).send({
          error: errorMessage
        })
        return;
      }

      let userJSON = {
        username: newUser.username,
        email: newUser.email,
        id: newUser._id
      }
      res.send({
        message: "User added.",
        user: userJSON,
        token: jwtSignUser(newUser)
      });
    });
  });
}


async function login(req, res) {
  try {
    const {
      username,
      password
    } = req.body;

    const userMatches = await UserModel.find({
      username: username,
    });

    const user = userMatches[0];




    if (!user) {
      return res.status(403).send({
        error: "Incorrect login information."
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(403).send({
        error: "Incorrect password."
      })
    }

    let userJSON = {
      username: user.username,
      email: user.email,
      id: user._id
    }

    res.send({
      user: userJSON,
      token: jwtSignUser(userJSON)
    });


  } catch (err) {

    console.log(err);


    res.status(500).send({
      error: "An error has occured."
    })
  }
}

module.exports = {
  register,
  login
}