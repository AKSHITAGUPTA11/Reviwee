module.exports = {
  apps: [
    {
      name: "reviewee-super-admin",
      script: "npm",
      args: "run start",
      cwd: __dirname,
      env: { NODE_ENV: "production" },
    },
  ],
};
