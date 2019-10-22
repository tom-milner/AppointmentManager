const http = require('http');
const crypto = require('crypto');
const util = require('util');
const exec = util.promisify(require("child_process").exec);


const port = 3360;

// create server to listen to github:
const server = http.createServer(handler);
server.listen(port, (err) => {
    if (err) {
        console.log("✗ Aborting.")
        console.log(err);
    }
    console.log(`Listening on ${port}`);
});


function handler(req, res) {
    switch (req.url) {
        // https://webhooks.apm.tomfmilner.com/pullLatest
        case "/pullLatest":
            pullLatest(req, res);
            break;
        default:
            res.end("Invalid webhook")
    }

}


function pullLatest(req, res) {

    const secret = "9c583a3a81446e06fb410e44f08a5f949536bbd1869a26797059";
    const repo = "/home/ubuntu/Projects/AppointmentManager";
    const token = "907f14f88356617a9ae9128c7efcdbd26cf46511";

    if (!req.method == "POST") res.end("Invalid method.")

    // get body
    let body;
    req.on("data", chunk => {
        body += chunk.toString();
    })

    req.on("end", async () => {

        const signature = req.headers["x-hub-signature"];
        if (!signature) res.end("No signature.")

        const computedSignature = `sha1=${crypto.createHmac("sha1", secret).update(body).digest("hex")}`
        if (computedSignature != signature) res.end("Bad signature.")

        const data = JSON.parse(body.replace("undefined", ""));

        if (data.repository.name == "AppointmentManager") {
            const pullCommand =
                `cd ${repo}; git pull https://tom-milner:${token}@github.com/tom-milner/AppointmentManager.git;`;

            // pull latest
            let response = "";

            response = await exec(pullCommand);

            // rebuild client
            response = await exec(`cd ${repo}/client; npm run build;`);

            // reload pm2 instances
            await exec(`pm2 reload all`);


            console.log("Deployed successfully.");
        }
        res.end("Done");
    })

}