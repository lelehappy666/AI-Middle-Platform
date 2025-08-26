# AI中台 - AI Middle Platform

一个基于React + TypeScript + Vite构建的AI中台系统，提供AI对话、录音分析、AI生成等功能。

## 功能特性

- 🤖 **AI对话**: 支持多种主流AI模型（OpenAI、Claude、Gemini等）
- 🎵 **录音分析**: 音频文件上传和智能分析
- 🎨 **AI生成**: AI内容生成功能
- 📁 **媒体管理**: 图片和视频文件管理
- ⚙️ **设置管理**: AI模型配置和系统设置

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 局域网访问

项目已配置支持局域网访问，启动开发服务器后：

1. **获取本机IP地址**：
   - Windows: 打开命令提示符，输入 `ipconfig`，查找 "IPv4 地址"
   - macOS/Linux: 打开终端，输入 `ifconfig` 或 `ip addr show`

2. **访问方式**：
   - 本地访问: `http://localhost:5173`
   - 局域网访问: `http://[你的IP地址]:5173`
   - 例如: `http://192.168.1.100:5173`

3. **注意事项**：
   - 确保防火墙允许5173端口访问
   - 确保设备在同一局域网内
   - 移动设备可通过浏览器直接访问IP地址

## 技术栈

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
