# AI中台 (AI Middle Platform)

一个现代化的AI中台应用，基于React + TypeScript构建，提供完整的AI服务集成解决方案。支持多种AI模型接入、智能对话、录音分析、AI内容生成和媒体资源管理等核心功能。

## ✨ 核心特性

### 🤖 AI对话系统
- 支持多种AI模型（OpenAI GPT、Claude、Gemini等）
- 实时流式对话响应
- 会话历史管理
- 自定义模型参数配置

### 🎙️ 录音分析
- 实时录音功能
- 语音转文字(STT)
- 智能内容分析
- 录音文件管理

### 🎨 AI内容生成
- 基于AI的文本生成
- 多种生成模式
- 结果导出和管理

### 📁 媒体资源管理
- 图片和视频展示
- 文件预览和详情
- 资源分类管理

### ⚙️ 智能配置
- AI模型配置管理
- API密钥安全存储
- 连接状态监控
- 参数调优界面

## 🛠️ 技术栈

### 前端技术
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router DOM
- **图标**: Lucide React
- **音频处理**: Web Audio API

### 开发工具
- **代码规范**: ESLint + TypeScript
- **包管理**: npm/pnpm
- **热重载**: Vite HMR

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0 或 pnpm >= 7.0.0

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm
pnpm install
```

### 启动开发服务器

```bash
# 本地开发（固定端口5174）
npm run dev

# 局域网访问
npm run dev -- --host
```

**⚠️ 重要提示：前端页面端口已固定为5174，请勿修改！**
- 开发服务器将在 `http://localhost:5174` 启动
- 端口配置位于 `vite.config.ts` 文件中
- 此端口配置已优化，请保持不变以确保项目稳定运行

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

### 代码检查

```bash
npm run check
```

## 🔧 AI模型配置

### 支持的AI服务商

1. **OpenAI**
   - 模型: GPT-3.5, GPT-4, GPT-4 Turbo等
   - 需要: API Key
   - 默认Base URL: `https://api.openai.com/v1`

2. **Anthropic Claude**
   - 模型: Claude-3, Claude-3.5等
   - 需要: API Key
   - 默认Base URL: `https://api.anthropic.com`

3. **Google Gemini**
   - 模型: Gemini Pro, Gemini Pro Vision等
   - 需要: API Key
   - 默认Base URL: `https://generativelanguage.googleapis.com/v1`

4. **自定义模型**
   - 支持兼容OpenAI API格式的自定义服务
   - 可配置自定义Base URL

### 配置步骤

1. 进入设置页面
2. 点击"添加新模型"或编辑现有模型
3. 填写模型信息：
   - 模型名称
   - 模型标识符
   - API密钥
   - Base URL（可选）
   - 最大Token数
   - 温度参数
4. 点击"测试连接"验证配置
5. 启用模型

## 📁 项目结构

```
AI-Middle-Platform/
├── src/
│   ├── components/          # 通用组件
│   │   ├── ui/             # UI基础组件
│   │   └── layout/         # 布局组件
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx        # 首页
│   │   ├── Images.tsx      # 图片管理
│   │   ├── Videos.tsx      # 视频管理
│   │   ├── AIChat.tsx      # AI对话
│   │   ├── Recording.tsx   # 录音分析
│   │   ├── Generation.tsx  # AI生成
│   │   └── Settings.tsx    # 设置页面
│   ├── stores/             # 状态管理
│   │   ├── aiStore.ts      # AI相关状态
│   │   └── fileStore.ts    # 文件管理状态
│   ├── utils/              # 工具函数
│   │   ├── aiApi.ts        # AI API调用
│   │   └── fileUtils.ts    # 文件处理
│   ├── types/              # 类型定义
│   ├── App.tsx             # 应用入口
│   └── main.tsx            # 主入口
├── public/                 # 静态资源
├── .trae/                  # 项目文档
│   └── documents/
│       ├── 产品需求文档.md
│       └── 技术架构文档.md
└── package.json
```

## 🎯 功能模块详解

### 1. AI对话模块
- **位置**: `/chat`
- **功能**: 多模型AI对话，支持会话管理
- **特性**: 流式响应、历史记录、模型切换

### 2. 录音分析模块
- **位置**: `/recording`
- **功能**: 实时录音、语音转文字、智能分析
- **特性**: 实时录音、音频可视化、分析结果导出

### 3. AI生成模块
- **位置**: `/generation`
- **功能**: 基于AI的内容生成
- **特性**: 多种生成模式、结果管理、批量生成

### 4. 媒体管理模块
- **位置**: `/images`, `/videos`
- **功能**: 图片和视频的展示与管理
- **特性**: 文件预览、详情查看、分类管理

### 5. 设置模块
- **位置**: `/settings`
- **功能**: AI模型配置、系统设置
- **特性**: 模型管理、连接测试、参数调优

## 🔒 安全性考虑

- API密钥本地存储，不上传服务器
- 支持自定义API端点
- 请求数据加密传输
- 敏感信息脱敏处理

## 🚀 部署指南

### 开发环境
```bash
# 启动开发服务器（端口：5174）
npm run dev
```

**端口说明：**
- 前端开发服务器固定运行在端口 `5174`
- 访问地址：`http://localhost:5174`
- 端口配置已在 `vite.config.ts` 中固定，请勿修改

### 生产环境
```bash
npm run build
npm run preview
```

### Docker部署
```dockerfile
# Dockerfile示例
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4173
CMD ["npm", "run", "preview"]
```

## 🐛 常见问题

### Q: AI模型连接失败？
A: 请检查：
1. API密钥是否正确
2. Base URL是否可访问
3. 网络连接是否正常
4. 模型标识符是否正确

### Q: 录音功能无法使用？
A: 请确保：
1. 浏览器支持Web Audio API
2. 已授权麦克风权限
3. 使用HTTPS协议访问

### Q: 页面加载缓慢？
A: 建议：
1. 检查网络连接
2. 清除浏览器缓存
3. 使用现代浏览器

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 项目讨论区

---

**AI中台** - 让AI服务触手可及 🚀

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  extends: [
    // other configs...
    // Enable lint rules for React
    reactX.configs['recommended-typescript'],
    // Enable lint rules for React DOM
    reactDom.configs.recommended,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```
