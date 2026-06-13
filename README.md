# MAIN LJ — 个人智能知识中枢

两级认证的个人系统集合入口，第一级为图书馆管理风格登录页，第二级为科技红色助记词解锁页，解锁后进入子系统仪表盘。

## 技术栈

- **前端**: Vue 3 + Vite + TypeScript + Pinia + Vue Router
- **后端**: Express.js + TypeScript
- **数据库**: SQLite (sql.js)
- **认证**: 服务端 Session + bcrypt
- **部署**: Docker + Nginx

## 快速开始

### 开发环境

```bash
# 后端
cd server
npm install
cp ../.env.example .env   # 编辑凭据
npm run seed              # 初始化用户
npm run dev               # 启动 Express (port 3000)

# 前端 (新终端)
cd client
npm install
npm run dev               # 启动 Vite (port 5173, 自动代理 API)
```

访问 http://localhost:5173

### Docker 部署

```bash
cp .env.example .env      # 编辑凭据和密钥
docker compose up -d      # 构建并启动 (port 80)
```

## 默认凭据

| 字段 | 默认值 |
|------|--------|
| 用户名 | admin |
| 密码 | admin123 |
| 助记词 | apple banana cherry delta echo |

首次部署后通过环境变量修改。

## 项目结构

```
MAIN_LJ/
├── client/              # Vue 3 前端
│   └── src/
│       ├── views/       # 三个页面 (LoginStage1, LoginStage2, Dashboard)
│       ├── components/  # LoginForm, MnemonicInput, AppCard
│       ├── router/      # 路由守卫
│       ├── stores/      # Pinia Auth Store
│       └── api/         # Axios 封装
├── server/              # Express 后端
│   └── src/
│       ├── auth/        # 认证路由、中间件、校验
│       ├── db.ts        # SQLite 初始化
│       ├── seed.ts      # 凭据种子脚本
│       └── index.ts     # 入口
├── docker/              # Docker 配置
│   ├── Dockerfile       # 多阶段构建
│   ├── nginx.conf       # Nginx 静态文件 + API 代理
│   └── entrypoint.sh    # 启动脚本
└── docker-compose.yml
```

## 子系统接入

在 `client/src/views/Dashboard.vue` 的 `apps` 数组中添加新条目：

```typescript
{ id: 'my-app', name: '我的系统', description: '...', icon: '🆕', url: '/my-app' }
```

然后在服务器反向代理 (Traefik/Nginx) 中配置对应路由指向子系统容器。
