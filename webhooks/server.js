#!/usr/bin/env node

// TOOD: use .env

const http = require("http");
const crypto = require("crypto");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv"); // Required for loading custom environment variables.
const port = 3360;

// Load in custom environment variables
const envFilePath = path.join(__dirname, "./.env");

dotenv.config({
    path: envFilePath
});

const secret = process.env.SECRET;
const repo = process.env.REPO;
const token = process.env.REPO_TOKEN;

// create server .
const server = http.createServer(handler);
server.listen(port, err => {
    if (err) {
        console.log("✗ Aborting.");
        console.log(err);
        process.exit();
    }
    console.log(`Listening on ${port}`);
});

function handler(req, res) {
    switch (req.url) {
        // https://webhooks.tomfmilner.com/pullLatest
        case "/pullLatest":
            pullLatest(req, res);
            break;
        case "/commitId":
            getCurrentCommit(req, res);
            break;
        default:
            res.end("Invalid webhook.");
    }
}

async function getCurrentCommit(req, res) {
    const gitInfo = await exec(`cd ${repo}; git rev-parse HEAD`);
    console.log(gitInfo);
    res.end(gitInfo.stdout);
}

function pullLatest(req, res) {
    if (!req.method == "POST") res.end("Invalid method.");

    // get body
    let body;
    req.on("data", chunk => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        const signature = req.headers["x-hub-signature"];
        if (!signature) res.end("No signature.");

        const computedSignature = `sha1=${crypto
            .createHmac("sha1", secret)
            .update(body)
            .digest("hex")}`;
        if (computedSignature != signature) res.end("Bad signature.");

        const data = JSON.parse(body.replace("undefined", ""));

        if (data.repository.name == "AppointmentManager") {
            // pull latest
            try {
                let response = "";
                response = await exec(
                    `cd ${repo}; git fetch https://tom-milner:${token}@github.com/tom-milner/AppointmentManager.git;`
                );
                console.log(response);

                response = await exec(`cd ${repo}; git reset --hard FETCH_HEAD `);
                console.log(response);

                response = await exec(`cd ${repo}/api; npm i --save; npm audit fix`);

                // rebuild client
                response = await exec(`cd ${repo}/client; npm i --save; npm audit fix `);

                response = await exec(`cd ${repo}/client; npm run build;`);
                console.log(response);

                // reload pm2 instances
                response = await exec(`pm2 restart all`);
                console.log(response);

                console.log("Deployed successfully.");
            } catch (err) {
                console.log(err);
            }
        }
        res.end("Done");
    });
}
