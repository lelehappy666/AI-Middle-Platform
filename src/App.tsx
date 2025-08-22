import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Images from "@/pages/Images";
import Videos from "@/pages/Videos";
import MediaDetail from "@/pages/MediaDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/images" element={<Images />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/media/:id" element={<MediaDetail />} />
        <Route path="/about" element={<div className="text-center text-xl py-12">关于页面 - 敬请期待</div>} />
        <Route path="*" element={<div className="text-center text-xl py-12">页面未找到</div>} />
      </Routes>
    </Router>
  );
}
