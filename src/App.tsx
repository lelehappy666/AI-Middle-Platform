import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "@/pages/Home";
import Images from "@/pages/Images";
import Videos from "@/pages/Videos";
import MediaDetail from "@/pages/MediaDetail";
import AIChat from "@/pages/AIChat";
import AudioAnalysis from "@/pages/AudioAnalysis";
import AIGenerate from "@/pages/AIGenerate";
import Settings from "@/pages/Settings";
import About from "@/pages/About";
import Login from "@/pages/Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthActions } from "@/store/authStore";

export default function App() {
  const { checkAuth } = useAuthActions()

  // 应用启动时检查认证状态
  useEffect(() => {
    console.log('🚀 App - 应用启动，检查认证状态')
    checkAuth()
  }, [])

  return (
    <Router>
      <Routes>
        {/* 登录页面 - 不需要保护 */}
        <Route path="/login" element={<Login />} />
        
        {/* 受保护的路由 */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/images" element={
          <ProtectedRoute>
            <Images />
          </ProtectedRoute>
        } />
        <Route path="/videos" element={
          <ProtectedRoute>
            <Videos />
          </ProtectedRoute>
        } />
        <Route path="/media/:id" element={
          <ProtectedRoute>
            <MediaDetail />
          </ProtectedRoute>
        } />
        
        {/* AI功能路由 - 受保护 */}
        <Route path="/ai/chat" element={
          <ProtectedRoute>
            <AIChat />
          </ProtectedRoute>
        } />
        <Route path="/ai/audio" element={
          <ProtectedRoute>
            <AudioAnalysis />
          </ProtectedRoute>
        } />
        <Route path="/ai/generate" element={
          <ProtectedRoute>
            <AIGenerate />
          </ProtectedRoute>
        } />
        
        {/* 设置页面 - 受保护 */}
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        
        <Route path="/about" element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        } />
        
        {/* 404页面 - 受保护 */}
        <Route path="*" element={
          <ProtectedRoute>
            <div className="text-center text-xl py-12">页面未找到</div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
