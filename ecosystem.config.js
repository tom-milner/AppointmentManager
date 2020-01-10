module.exports = {
    apps: [{
        name: "AppointmentManagerAPI",
        cwd: "/home/pi/Projects/AppointmentManager/api",
        script: "./src/app.js",
        env: {
            "NODE_ENV": "production"
        }
    }]
};