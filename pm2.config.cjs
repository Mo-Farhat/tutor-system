module.exports = {
  apps: [
    {
      name: "my-backend",
      cwd: "./backend",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "3001"
      }
    }
  ]
};