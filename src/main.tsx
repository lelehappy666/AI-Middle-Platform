import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 在开发环境中加载数据库清理工具
if (import.meta.env.DEV) {
  import('./lib/dbCleanup');
}
import { mediaStorage } from "./lib/storage";

// 初始化数据库后再渲染应用
async function initApp() {
  try {
    await mediaStorage.init();
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
  
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

initApp();
