module.exports = {
  apps: [
    {
      name: 'fe-router-gateway',
      script: 'dist/main.js',
      instances: process.env.CLUSTER_ENABLED === 'true' ? 'max' : 1,
      exec_mode: process.env.CLUSTER_ENABLED === 'true' ? 'cluster' : 'fork',

      // 环境变量
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: '.env',

      // 性能配置
      max_memory_restart: '512M',
      node_args: '--max_old_space_size=512',

      // 日志配置
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // 监控和重启策略
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'coverage'],
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,

      // 健康检查
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,

      // 进程标题
      name_with_port: true,

      // 其他配置
      autorestart: true,
      cron_restart: '0 2 * * *', // 每天凌晨2点重启
      source_map_support: true,
      instance_var: 'INSTANCE_ID',
    },
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/feRouter.git',
      path: '/opt/fe-router-gateway',
      'pre-deploy-local': '',
      'post-deploy':
        'cd apps/gateway && pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
