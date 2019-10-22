module.exports = {
    apps: [{
        name: "api",
        cwd: "/home/ubuntu/Projects/AppointmentManager/api/",
        script: "app.js",
        env: {
            "NODE_ENV": "production"
        }
    }]
};