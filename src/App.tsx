import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Images from "@/pages/Images";
import Videos from "@/pages/Videos";
import MediaDetail from "@/pages/MediaDetail";
import AIChat from "@/pages/AIChat";
import AudioAnalysis from "@/pages/AudioAnalysis";
import AIGenerate from "@/pages/AIGenerate";
import Settings from "@/pages/Settings";
import About from "@/pages/About";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/images" element={<Images />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/media/:id" element={<MediaDetail />} />
        
        {/* AI功能路由 */}
        <Route path="/ai/chat" element={<AIChat />} />
        <Route path="/ai/audio" element={<AudioAnalysis />} />
        <Route path="/ai/generate" element={<AIGenerate />} />
        
        {/* 设置页面 */}
        <Route path="/settings" element={<Settings />} />
        
        <Route path="/about" element={<About />} />
        <Route path="*" element={<div className="text-center text-xl py-12">页面未找到</div>} />
      </Routes>
    </Router>
  );
}
