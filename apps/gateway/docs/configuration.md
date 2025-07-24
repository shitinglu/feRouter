# feRouter Gateway 配置说明

## 配置概览

feRouter Gateway 支持多种配置方式，优先级从高到低为：

1. 环境变量
2. 配置文件 (.env)
3. 默认值

## 应用基础配置

### 服务配置

```env
# 服务端口
PORT=3000

# 运行环境 (development | test | production)
NODE_ENV=production

# 全局路径前缀
GLOBAL_PREFIX=/api

# 日志级别 (error | warn | info | debug)
LOG_LEVEL=info

# 请求体大小限制
MAX_REQUEST_SIZE=10mb

# 启用 HTTPS
ENABLE_HTTPS=false
HTTPS_KEY_PATH=/path/to/private.key
HTTPS_CERT_PATH=/path/to/certificate.crt
```

### CORS 配置

```env
# 允许的源 (逗号分隔)
CORS_ORIGIN=https://www.example.com,https://admin.example.com

# 允许的方法
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS

# 允许的头部
CORS_HEADERS=Origin,X-Requested-With,Content-Type,Accept,Authorization,X-API-Key

# 是否允许携带凭证
CORS_CREDENTIALS=true

# 预检请求缓存时间 (秒)
CORS_MAX_AGE=86400
```

## OSS 存储配置

### 基础配置

```env
# 默认区域
OSS_REGION=oss-cn-hangzhou

# 访问密钥
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret

# 默认存储桶
OSS_BUCKET=default-bucket

# OSS 端点 (可选，自动生成)
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com

# 是否使用内网端点
OSS_INTERNAL=false

# 是否使用 HTTPS
OSS_SECURE=true

# 连接超时时间 (毫秒)
OSS_TIMEOUT=60000
```

### 多存储桶配置

在配置文件中定义多个存储桶：

```typescript
// config/oss.config.ts
export default () => ({
  oss: {
    default: {
      region: process.env.OSS_REGION,
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    },
    buckets: {
      // 静态网站存储桶
      'static-web': {
        bucket: 'my-static-website',
        region: 'oss-cn-hangzhou',
        endpoint: 'https://my-static-website.oss-cn-hangzhou.aliyuncs.com',
        cname: true, // 使用自定义域名
      },

      // 文档存储桶
      documentation: {
        bucket: 'my-docs-bucket',
        region: 'oss-cn-beijing',
        internal: true, // 使用内网端点
      },

      // 图片资源存储桶
      images: {
        bucket: 'my-images-bucket',
        region: 'oss-cn-shenzhen',
        accessKeyId: 'separate_access_key', // 独立密钥
        accessKeySecret: 'separate_secret_key',
      },
    },
  },
});
```

### CDN 配置

```env
# 启用 CDN 加速
OSS_CDN_ENABLED=true

# CDN 域名映射 (JSON 格式)
OSS_CDN_DOMAINS={"static-web":"https://cdn.example.com","images":"https://img.example.com"}

# CDN 缓存时间 (秒)
OSS_CDN_CACHE_TIME=3600
```

## Redis 缓存配置

### 基础配置

```env
# Redis 主机
REDIS_HOST=localhost

# Redis 端口
REDIS_PORT=6379

# Redis 密码
REDIS_PASSWORD=your_redis_password

# Redis 数据库编号
REDIS_DB=0

# 连接超时时间 (毫秒)
REDIS_CONNECT_TIMEOUT=5000

# 命令超时时间 (毫秒)
REDIS_COMMAND_TIMEOUT=3000

# 重试次数
REDIS_RETRY_ATTEMPTS=3

# 重试延迟 (毫秒)
REDIS_RETRY_DELAY=1000
```

### 集群配置

```env
# Redis 集群模式
REDIS_CLUSTER_ENABLED=true

# 集群节点 (逗号分隔)
REDIS_CLUSTER_NODES=redis1.example.com:6379,redis2.example.com:6379,redis3.example.com:6379

# 集群配置
REDIS_CLUSTER_OPTIONS={"redisOptions":{"password":"cluster_password"},"enableReadyCheck":false,"maxRetriesPerRequest":3}
```

### 哨兵配置

```env
# Redis 哨兵模式
REDIS_SENTINEL_ENABLED=true

# 哨兵主节点名称
REDIS_SENTINEL_MASTER_NAME=mymaster

# 哨兵节点 (JSON 格式)
REDIS_SENTINEL_NODES=[{"host":"sentinel1.example.com","port":26379},{"host":"sentinel2.example.com","port":26379}]

# 哨兵密码
REDIS_SENTINEL_PASSWORD=sentinel_password
```

## 缓存策略配置

### 内存缓存

```env
# 内存缓存最大条目数
MEMORY_CACHE_MAX_SIZE=10000

# 内存缓存默认 TTL (秒)
MEMORY_CACHE_TTL=300

# 内存缓存检查间隔 (秒)
MEMORY_CACHE_CHECK_PERIOD=60

# 启用 LRU 淘汰策略
MEMORY_CACHE_LRU=true
```

### Redis 缓存

```env
# Redis 缓存键前缀
REDIS_CACHE_PREFIX=gateway:cache:

# Redis 缓存默认 TTL (秒)
REDIS_CACHE_TTL=3600

# 最大缓存大小 (字节)
REDIS_CACHE_MAX_SIZE=104857600

# 缓存压缩
REDIS_CACHE_COMPRESSION=true
```

### 缓存策略

```typescript
// config/cache.config.ts
export default () => ({
  cache: {
    // 缓存策略
    strategy: 'multi-level', // 'memory-only' | 'redis-only' | 'multi-level'

    // 内存缓存配置
    memory: {
      maxSize: parseInt(process.env.MEMORY_CACHE_MAX_SIZE, 10) || 10000,
      ttl: parseInt(process.env.MEMORY_CACHE_TTL, 10) || 300,
      checkPeriod: parseInt(process.env.MEMORY_CACHE_CHECK_PERIOD, 10) || 60,
    },

    // Redis 缓存配置
    redis: {
      keyPrefix: process.env.REDIS_CACHE_PREFIX || 'gateway:cache:',
      ttl: parseInt(process.env.REDIS_CACHE_TTL, 10) || 3600,
      maxSize:
        parseInt(process.env.REDIS_CACHE_MAX_SIZE, 10) || 100 * 1024 * 1024,
      compression: process.env.REDIS_CACHE_COMPRESSION === 'true',
    },

    // 预热配置
    warmup: {
      enabled: process.env.CACHE_WARMUP_ENABLED === 'true',
      routes: process.env.CACHE_WARMUP_ROUTES?.split(',') || [],
      interval: parseInt(process.env.CACHE_WARMUP_INTERVAL, 10) || 3600,
    },
  },
});
```

## 路由配置

### 路由配置文件

```json
// config/routes.json
{
  "version": "1.0.0",
  "lastUpdated": "2024-01-15T10:00:00.000Z",
  "routes": [
    {
      "id": "home-page",
      "path": "/",
      "method": ["GET"],
      "ossPath": "pages/home/index.html",
      "bucket": "static-web",
      "priority": 100,
      "enabled": true,

      // 缓存配置
      "cacheConfig": {
        "enabled": true,
        "ttl": 600,
        "varyBy": ["host", "user-agent"]
      },

      // 响应头配置
      "headers": {
        "X-Page-Type": "home",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Version": "1.0"
      },

      // 匹配条件
      "conditions": {
        "domain": "www.example.com",
        "userAgent": "!bot",
        "ip": "!192.168.1.0/24",
        "headers": {
          "Accept-Language": "zh-CN"
        }
      },

      // 降级配置
      "fallback": {
        "bucket": "backup-web",
        "ossPath": "pages/maintenance.html"
      }
    },

    {
      "id": "docs-wildcard",
      "path": "/docs/*",
      "method": ["GET"],
      "ossPath": "docs/{{path}}.html", // 支持模板变量
      "bucket": "documentation",
      "priority": 80,
      "enabled": true,

      "conditions": {
        "domain": ["docs.example.com", "help.example.com"]
      },

      "headers": {
        "X-Page-Type": "documentation"
      }
    },

    {
      "id": "api-proxy",
      "path": "/api/*",
      "method": ["GET", "POST", "PUT", "DELETE"],
      "type": "proxy", // 代理类型路由
      "target": "http://api-server.internal:3001",
      "priority": 90,
      "enabled": true,

      "proxyConfig": {
        "timeout": 30000,
        "retries": 3,
        "headers": {
          "X-Forwarded-By": "feRouter-Gateway"
        }
      }
    }
  ],

  // 错误页面配置
  "errorPages": {
    "404": {
      "bucket": "static-web",
      "ossPath": "errors/404.html"
    },
    "500": {
      "bucket": "static-web",
      "ossPath": "errors/500.html"
    }
  },

  // 全局设置
  "globalSettings": {
    "defaultCacheTime": 300,
    "maxRedirects": 5,
    "timeout": 10000
  }
}
```

### 动态路由配置

```env
# 启用动态路由配置
DYNAMIC_ROUTES_ENABLED=true

# 配置更新间隔 (秒)
ROUTES_UPDATE_INTERVAL=60

# 配置源类型 (file | redis | http)
ROUTES_CONFIG_SOURCE=file

# HTTP 配置源
ROUTES_CONFIG_URL=https://config.example.com/routes.json
ROUTES_CONFIG_AUTH_TOKEN=your_auth_token

# Redis 配置源
ROUTES_CONFIG_REDIS_KEY=gateway:routes:config

# 配置验证
ROUTES_VALIDATION_ENABLED=true
ROUTES_SCHEMA_PATH=./config/routes.schema.json
```

## 安全配置

### 认证配置

```env
# API 密钥认证
ADMIN_API_KEY=your-super-secret-api-key

# JWT 配置 (如果启用 JWT 认证)
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=1h
JWT_ISSUER=feRouter-Gateway

# 密钥轮换
API_KEY_ROTATION_ENABLED=true
API_KEY_ROTATION_INTERVAL=86400
```

### 访问控制

```env
# IP 白名单 (逗号分隔)
IP_WHITELIST=192.168.1.0/24,10.0.0.0/8

# IP 黑名单
IP_BLACKLIST=192.168.1.100,10.0.0.50

# 管理接口 IP 限制
ADMIN_IP_WHITELIST=192.168.1.0/24

# 地理位置限制
GEO_RESTRICTION_ENABLED=false
GEO_ALLOWED_COUNTRIES=CN,US,GB
```

### 限流配置

```env
# 全局限流
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=60000  # 1分钟
RATE_LIMIT_MAX=1000      # 每分钟最大请求数

# API 接口限流
API_RATE_LIMIT_WINDOW=60000
API_RATE_LIMIT_MAX=100

# 基于 IP 的限流
IP_RATE_LIMIT_ENABLED=true
IP_RATE_LIMIT_WINDOW=60000
IP_RATE_LIMIT_MAX=500

# 基于路由的限流 (JSON 格式)
ROUTE_RATE_LIMITS={"\/api\/upload":{"window":60000,"max":10},"\/api\/search":{"window":60000,"max":100}}
```

### 安全头配置

```env
# 启用安全头
SECURITY_HEADERS_ENABLED=true

# HSTS 配置
HSTS_ENABLED=true
HSTS_MAX_AGE=31536000
HSTS_INCLUDE_SUBDOMAINS=true

# CSP 配置
CSP_ENABLED=true
CSP_DIRECTIVES=default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'

# 其他安全头
X_FRAME_OPTIONS=DENY
X_CONTENT_TYPE_OPTIONS=nosniff
X_XSS_PROTECTION=1; mode=block
REFERRER_POLICY=strict-origin-when-cross-origin
```

## 监控配置

### 指标收集

```env
# 启用指标收集
METRICS_ENABLED=true

# 指标端点路径
METRICS_PATH=/metrics

# 指标收集间隔 (秒)
METRICS_INTERVAL=15

# 自定义指标
CUSTOM_METRICS_ENABLED=true
```

### 健康检查

```env
# 健康检查路径
HEALTH_CHECK_PATH=/health

# 健康检查超时 (毫秒)
HEALTH_CHECK_TIMEOUT=5000

# 检查项配置
HEALTH_CHECK_REDIS=true
HEALTH_CHECK_OSS=true
HEALTH_CHECK_DISK=true
HEALTH_CHECK_MEMORY=true

# 内存使用警告阈值 (百分比)
MEMORY_WARNING_THRESHOLD=80
MEMORY_CRITICAL_THRESHOLD=95

# 磁盘使用警告阈值 (百分比)
DISK_WARNING_THRESHOLD=80
DISK_CRITICAL_THRESHOLD=95
```

### 日志配置

```env
# 日志级别
LOG_LEVEL=info

# 日志格式 (json | text)
LOG_FORMAT=json

# 日志输出 (console | file | both)
LOG_OUTPUT=both

# 日志文件路径
LOG_FILE_PATH=/var/log/fe-router-gateway/app.log

# 日志轮转
LOG_ROTATION_ENABLED=true
LOG_MAX_SIZE=10MB
LOG_MAX_FILES=10

# 访问日志
ACCESS_LOG_ENABLED=true
ACCESS_LOG_PATH=/var/log/fe-router-gateway/access.log
ACCESS_LOG_FORMAT=combined

# 错误日志
ERROR_LOG_ENABLED=true
ERROR_LOG_PATH=/var/log/fe-router-gateway/error.log

# 审计日志
AUDIT_LOG_ENABLED=true
AUDIT_LOG_PATH=/var/log/fe-router-gateway/audit.log
```

## 性能优化配置

### Node.js 优化

```env
# V8 内存限制 (MB)
NODE_MAX_OLD_SPACE_SIZE=512

# 垃圾回收优化
NODE_GC_OPTIMIZE=true

# 事件循环监控
EVENT_LOOP_MONITORING=true
EVENT_LOOP_DELAY_THRESHOLD=100

# 集群模式
CLUSTER_ENABLED=true
CLUSTER_WORKERS=0  # 0 表示使用 CPU 核心数
```

### 连接池配置

```env
# HTTP Keep-Alive
HTTP_KEEP_ALIVE=true
HTTP_KEEP_ALIVE_TIMEOUT=5000

# OSS 连接池
OSS_CONNECTION_POOL_SIZE=10
OSS_CONNECTION_TIMEOUT=10000

# Redis 连接池
REDIS_POOL_SIZE=10
REDIS_POOL_MIN=2
```

## 环境特定配置

### 开发环境

```env
# .env.development
NODE_ENV=development
LOG_LEVEL=debug
METRICS_ENABLED=true

# 开发工具
HOT_RELOAD=true
SOURCE_MAPS=true
DEBUG_MODE=true

# 模拟延迟
SIMULATE_LATENCY=false
SIMULATE_LATENCY_MS=100
```

### 测试环境

```env
# .env.test
NODE_ENV=test
LOG_LEVEL=warn

# 测试配置
TEST_TIMEOUT=30000
TEST_REDIS_DB=15
TEST_OSS_BUCKET=test-bucket

# 模拟配置
MOCK_OSS=true
MOCK_REDIS=false
```

### 生产环境

```env
# .env.production
NODE_ENV=production
LOG_LEVEL=info

# 生产优化
COMPRESSION_ENABLED=true
CACHE_AGGRESSIVE=true

# 监控
APM_ENABLED=true
ERROR_TRACKING_ENABLED=true
```

## 配置验证

### 配置 Schema

```typescript
// config/config.schema.ts
import Joi from 'joi';

export const configSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),

  PORT: Joi.number().port().default(3000),

  OSS_ACCESS_KEY_ID: Joi.string().required().when('NODE_ENV', {
    is: 'production',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  REDIS_HOST: Joi.string().hostname().default('localhost'),

  REDIS_PORT: Joi.number().port().default(6379),

  CACHE_TTL: Joi.number().min(0).default(300),

  RATE_LIMIT_MAX: Joi.number().min(1).default(1000),

  // 更多验证规则...
});
```

### 配置加载

```typescript
// config/configuration.ts
import { configSchema } from './config.schema';

export default () => {
  const config = {
    port: parseInt(process.env.PORT, 10) || 3000,
    database: {
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    },
    // ... 其他配置
  };

  // 验证配置
  const { error, value } = configSchema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return value;
};
```

这个配置文档提供了详细的配置说明和示例，帮助用户根据不同的部署环境和需求进行合适的配置。
