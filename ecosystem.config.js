module.exports = {
  apps: [{
    name: 'megabaji-backend',
    script: './index.js',
    instances: 'max',  // Cluster mode
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      HOST: '0.0.0.0'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    kill_timeout: 5000,
    listen_timeout: 30000,
    cwd: '/var/www/megabaji-backend'
  }]
};
