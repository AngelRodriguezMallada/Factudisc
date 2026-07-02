module.exports = {
  apps: [
    {
      name: "facturadiscord-web",
      cwd: "./apps/web",
      script: "npm",
      args: "start",
      env: { NODE_ENV: "production" },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: "facturadiscord-bot",
      cwd: "./apps/bot",
      script: "dist/index.js",
      env: { NODE_ENV: "production" },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
