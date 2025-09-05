import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  Trash2,
  Edit3,
  Copy,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Info,
  Calendar,
  HardDrive,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText
} from 'lucide-react';
import { Layout, PageContainer } from '../components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Modal, Loading } from '../components/ui';
import { useMediaStore } from '../store/mediaStore';
import { MediaFile } from '../types';
import { formatFileSize, formatDate, cn } from '../lib/utils';

interface MediaViewerProps {
  file: MediaFile;
}

const ImageViewer: React.FC<MediaViewerProps> = ({ file }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // 生成原分辨率图片URL（强制刷新版本）
  useEffect(() => {
    console.log('Debug: ImageViewer file object:', file);
    console.log('Debug: file.file:', file.file);
    console.log('Debug: file.file instanceof File:', file.file instanceof File);
    console.log('Debug: file.file type:', typeof file.file);
    console.log('Debug: file.file size:', file.file?.size);
    
    if (!file.file || !(file.file instanceof File)) {
      console.error('Invalid file object:', file.file);
      return;
    }
    
    try {
      const url = file.url || URL.createObjectURL(file.file);
      console.log('Debug: Generated blob URL:', url);
      // 添加时间戳确保浏览器不使用缓存
      const urlWithTimestamp = `${url}?t=${Date.now()}`;
      setImageUrl(urlWithTimestamp);
      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error('Error creating object URL:', error);
    }
  }, [file.file]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="relative h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-xl overflow-hidden shadow-inner">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Modern Control Panel */}
      <div className="absolute top-6 right-6 z-20">
        <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="h-10 w-10 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="h-10 w-10 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-gray-200" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRotate}
            className="h-10 w-10 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all duration-200"
            title="旋转"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-10 w-10 rounded-xl hover:bg-green-50 hover:text-green-600 transition-all duration-200"
            title="全屏"
          >
            <Maximize className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-gray-200" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-10 px-4 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-sm font-medium"
            title="重置视图"
          >
            重置
          </Button>
        </div>
      </div>

      {/* Enhanced Zoom Indicator */}
      {zoom !== 1 && (
        <div className="absolute top-6 left-6 z-20">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-2xl shadow-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-semibold">{Math.round(zoom * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Image Container with Enhanced Styling */}
      <div 
        className={cn(
          "min-h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-300",
          zoom > 1 ? "cursor-grab" : "cursor-default",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="relative">
          {/* Image Shadow/Glow Effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl transform scale-105 sm:scale-110"
            style={{
              transform: `scale(${Math.max(1.05, zoom * 0.1 + 1)}) rotate(${rotation}deg)`,
            }}
          />
          
          <img
            ref={imageRef}
            src={imageUrl}
            alt={file.name}
            className="relative block transition-all duration-300 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white/50"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              maxWidth: 'none',
              maxHeight: 'none',
              filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.4))'
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md flex items-center justify-center">
          <Button
            variant="ghost"
            onClick={toggleFullscreen}
            className="absolute top-6 right-6 text-white hover:bg-white/10 rounded-full p-3"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <img
            src={imageUrl}
            alt={file.name}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
            style={{
              transform: `rotate(${rotation}deg)`,
            }}
          />
        </div>
      )}
    </div>
  );
};

const VideoViewer: React.FC<MediaViewerProps> = ({ file }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div 
      className="relative h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-inner"
      onMouseMove={handleMouseMove}
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-3xl" />
      </div>

      {/* Video Container with Enhanced Styling */}
      <div className="relative h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="relative w-full h-full max-w-full max-h-full">
          {/* Video Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-xl sm:rounded-2xl blur-xl sm:blur-2xl transform scale-105 sm:scale-110" />
          
          <video
            ref={videoRef}
            src={file.url || URL.createObjectURL(file.file)}
            className="relative block w-full h-full object-contain rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl border border-white/10 sm:border-2"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
            style={{
              filter: 'drop-shadow(0 15px 35px rgba(0, 0, 0, 0.4))'
            }}
          />
        </div>
      </div>
      
      {/* Enhanced Video Controls */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out',
        showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}>
        {/* Control Panel Background */}
        <div className="bg-gradient-to-t from-slate-900/90 via-slate-800/70 to-transparent backdrop-blur-md">
          <div className="p-4 sm:p-6">
            {/* Progress Bar */}
            <div className="mb-4 sm:mb-6">
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 sm:h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-white/70 mt-1 sm:mt-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Play/Pause Button */}
                <Button
                  variant="ghost"
                  size={isMobile ? "sm" : "lg"}
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 rounded-full p-2 sm:p-3 transition-all duration-200 hover:scale-110"
                >
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-6 sm:h-6" /> : <Play className="w-4 h-4 sm:w-6 sm:h-6" />}
                </Button>
                
                {/* Volume Controls */}
                <div className="flex items-center space-x-2 sm:space-x-3 bg-white/10 rounded-full px-2 py-1 sm:px-4 sm:py-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2"
                  >
                    {isMuted ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" /> : <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </Button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #ffffff ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%)`
                    }}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-full p-2 sm:p-3 transition-all duration-200 hover:scale-110"
                >
                  <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Play Button Overlay for Paused State */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-8 animate-pulse">
            <Play className="w-16 h-16 text-white" />
          </div>
        </div>
      )}
    </div>
  );
};

interface FileInfoPanelProps {
  file: MediaFile;
  onDelete: () => void;
  isDeleting: boolean;
}

const FileInfoPanel: React.FC<FileInfoPanelProps> = ({ file, onDelete, isDeleting }) => {
  const [showMetadata, setShowMetadata] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const metadata = [
    { label: '文件名', value: file.name, copyable: true },
    { label: '文件大小', value: formatFileSize(file.size) },
    { label: '文件类型', value: file.type === 'image' ? '图片' : '视频' },
    { label: '创建时间', value: formatDate(file.lastModified) },
    { label: '修改时间', value: formatDate(file.lastModified) },
    { label: '文件路径', value: file.name, copyable: true },
  ];

  if (file.dimensions) {
    metadata.splice(3, 0, {
      label: '尺寸',
      value: `${file.dimensions.width} × ${file.dimensions.height}`
    });
  }

  if (file.duration) {
    const mins = Math.floor(file.duration / 60);
    const secs = Math.floor(file.duration % 60);
    metadata.splice(file.dimensions ? 4 : 3, 0, {
      label: '时长',
      value: `${mins}:${secs.toString().padStart(2, '0')}`
    });
  }

  return (
    <div className="h-full bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-xl border border-gray-200/50 backdrop-blur-sm">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-t-2xl p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {file.type === 'image' ? (
              <ImageIcon className="w-6 h-6" />
            ) : (
              <VideoIcon className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{file.name}</h3>
            <p className="text-blue-100 text-sm">{file.type === 'image' ? '图片' : '视频'}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* File Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-blue-700 text-sm font-medium">文件大小</span>
            </div>
            <p className="text-gray-900 font-semibold">{formatFileSize(file.size)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-purple-700 text-sm font-medium">修改时间</span>
            </div>
            <p className="text-gray-900 font-semibold text-xs">{formatDate(file.lastModified)}</p>
          </div>
        </div>
        
        {/* Dimensions */}
        {file.dimensions && (
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200/50">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-700 text-sm font-medium">图片尺寸</span>
            </div>
            <p className="text-gray-900 font-semibold">{file.dimensions.width} × {file.dimensions.height} 像素</p>
          </div>
        )}
        
        {/* Duration */}
        {file.duration && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200/50">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-orange-700 text-sm font-medium">视频时长</span>
            </div>
            <p className="text-gray-900 font-semibold">{Math.floor(file.duration / 60)}:{Math.floor(file.duration % 60).toString().padStart(2, '0')}</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-3 transition-all duration-200 hover:scale-[1.02] shadow-lg" 
            variant="secondary"
          >
            <Download className="w-4 h-4 mr-2" />
            下载文件
          </Button>
          
          <Button 
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl py-3 transition-all duration-200 hover:scale-[1.02] shadow-lg" 
            variant="secondary"
          >
            <Share2 className="w-4 h-4 mr-2" />
            分享文件
          </Button>
          
          <Button 
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl py-3 transition-all duration-200 hover:scale-[1.02] shadow-lg" 
            variant="secondary"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? '删除中...' : '删除文件'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const MediaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { files, loadFiles, removeFile, getCurrentFolderFiles, currentFolderPath } = useMediaStore();
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState<MediaFile | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadFile = async () => {
      setIsLoading(true);
      await loadFiles();
      
      if (id) {
        const foundFile = files.find(f => f.id === id);
        setFile(foundFile || null);
      }
      
      setIsLoading(false);
    };

    loadFile();
  }, [id, loadFiles, files]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDelete = async () => {
    if (!file) return;
    
    setIsDeleting(true);
    try {
      // 删除前获取当前文件夹的所有文件和当前文件索引
      const currentFolderFiles = getCurrentFolderFiles();
      const currentFileIndex = currentFolderFiles.findIndex(f => f.id === file.id);
      const totalFilesBeforeDelete = currentFolderFiles.length;
      
      console.log('删除前文件信息:', {
        currentFileIndex,
        totalFilesBeforeDelete,
        currentFileId: file.id,
        currentFolderPath
      });
      
      // 删除文件
      await removeFile(file.id);
      
      // 重新加载文件列表
      await loadFiles();
      
      // 计算删除后的导航逻辑
      const totalFilesAfterDelete = totalFilesBeforeDelete - 1;
      
      if (totalFilesAfterDelete === 0) {
        // 如果文件夹为空，返回文件夹页面
        console.log('文件夹为空，返回图片库');
        navigate('/images');
      } else {
        // 文件夹还有文件，需要导航到下一张或上一张
        let nextFileIndex = currentFileIndex;
        
        // 如果删除的是最后一张，显示前一张
        if (currentFileIndex >= totalFilesAfterDelete) {
          nextFileIndex = totalFilesAfterDelete - 1;
        }
        
        console.log('计算下一个文件索引:', { nextFileIndex, totalFilesAfterDelete });
        
        // 等待一小段时间确保store状态更新
        setTimeout(() => {
          const updatedFolderFiles = getCurrentFolderFiles();
          console.log('更新后的文件列表:', updatedFolderFiles.length);
          
          if (updatedFolderFiles.length > 0 && nextFileIndex < updatedFolderFiles.length) {
            const nextFile = updatedFolderFiles[nextFileIndex];
            console.log('导航到下一个文件:', nextFile.id);
            navigate(`/media/${nextFile.id}`);
          } else {
            console.log('无法找到下一个文件，返回图片库');
            navigate('/images');
          }
        }, 100);
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      // 可以添加错误提示
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const confirmDelete = () => {
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <PageContainer>
          <div className="flex justify-center items-center py-12">
            <Loading size="lg" text="加载文件中..." />
          </div>
        </PageContainer>
      </Layout>
    );
  }

  if (!file) {
    return (
      <Layout>
        <PageContainer>
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">文件未找到</h3>
            <p className="text-gray-600 mb-6">请检查文件是否存在或已被删除</p>
            <Button onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 truncate max-w-md">
                {file.name}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <Badge variant={file.type === 'image' ? 'success' : 'info'}>
                  {file.type === 'image' ? '图片' : '视频'}
                </Badge>
                <span>{formatFileSize(file.size)}</span>
                {file.dimensions && (
                  <span>{file.dimensions.width} × {file.dimensions.height}</span>
                )}
                <span>{formatDate(file.lastModified)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="secondary">
              <ExternalLink className="w-4 h-4 mr-2" />
              在文件夹中显示
            </Button>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              下载
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6 min-h-[calc(100vh-8rem)]">
          {/* Media Viewer */}
          <div className="flex-1 min-h-0 order-1">
            <div className="h-full min-h-[60vh] xl:min-h-[calc(100vh-10rem)]">
              {file.type === 'image' ? (
                <ImageViewer file={file} />
              ) : (
                <VideoViewer file={file} />
              )}
            </div>
          </div>
          
          {/* File Info Panel */}
          <div className="w-full xl:w-80 2xl:w-96 flex-shrink-0 order-2 xl:order-2">
            <div className="h-full min-h-[400px] xl:min-h-[calc(100vh-10rem)]">
              <FileInfoPanel 
                file={file} 
                onDelete={confirmDelete}
                isDeleting={isDeleting}
              />
            </div>
          </div>
        </div>
      </PageContainer>
      
      {/* 删除确认对话框 */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        className="max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
              <p className="text-sm text-gray-600">此操作无法撤销</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            确定要删除文件 <span className="font-medium">{file?.name}</span> 吗？
          </p>
          
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
              disabled={isDeleting}
            >
              取消
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? '删除中...' : '确认删除'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default MediaDetail;