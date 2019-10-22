module.exports = {
    apps: [{
        name: "api",
        cwd: "/home/ubuntu/Projects/AppointmentManager/api/src",
        script: "app.js",
        env: {
            "NODE_ENV": "production"
        }
    }]
};