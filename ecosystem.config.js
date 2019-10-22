module.exports = {
    apps: [{
        name: "api",
        cwd: "./api/",
        script: "app.js",
        env: {
            "NODE_ENV": "production"
        }
    }]
};