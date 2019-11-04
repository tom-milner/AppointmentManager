module.exports = {
    apps: [{
        name: "AppointmentManagerAPI",
        cwd: "/home/pi/Projects/AppointmentManager/api/src",
        script: "./app.js",
        env: {
            "NODE_ENV": "production"
        }
    }]
};
