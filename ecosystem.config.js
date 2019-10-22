module.exports = {
    apps: [{
        name: "AppointmentManagerAPI",
        cwd: "/home/ubuntu/Projects/AppointmentManager/api/",
        node_args: 'dotenv/config',
        script: "src/app.js",
        env: {
            "NODE_ENV": "production"
        }
    }]
};