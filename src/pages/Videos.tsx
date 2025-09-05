import React, { useEffect, useState, useRef } from 'react';
import { Grid, List, Filter, SortAsc, SortDesc, Upload, Eye, Download, Trash2, MoreHorizontal, Play, Pause, Volume2, VolumeX, Maximize, Video, Folder, Search } from 'lucide-react';
import { Layout, PageContainer, PageHeader } from '../components/layout';
import { Button, Card, CardContent, Modal, Badge, SearchInput, Loading } from '../components/ui';
import { FolderView } from '../components/FolderView';
import { Breadcrumb } from '../components/Breadcrumb';
import { useMediaStore } from '../store/mediaStore';
import { MediaFile, SortOptions, SUPPORTED_VIDEO_TYPES } from '../types';
import { formatFileSize, formatDate, cn } from '../lib/utils';
import { selectFiles, selectDirectoryAndGetVideos, isDirectoryPickerSupported } from '../lib/fileSystem';

interface VideoCardProps {
  video: MediaFile;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPreview: (video: MediaFile) => void;
  viewMode: 'grid' | 'list';
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isSelected,
  onSelect,
  onPreview,
  viewMode
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (viewMode === 'list') {
    return (
      <Card className={cn(
        'hover:shadow-md transition-all duration-200 cursor-pointer',
        isSelected && 'ring-2 ring-blue-500 bg-blue-50'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-12 bg-gray-200 rounded-lg overflow-hidden">
                {isLoading && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loading size="sm" />
                  </div>
                )}
                <video
                ref={videoRef}
                src={video.url || URL.createObjectURL(video.file)}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-200',
                  isLoading ? 'opacity-0' : 'opacity-100'
                )}
                onLoadedData={handleVideoLoad}
                onError={handleVideoError}
                muted
                preload="metadata"
              />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="p-1 bg-black/50 hover:bg-black/70 text-white border-0"
                    onClick={(e) => {
              e.stopPropagation();
              togglePlay(e);
            }}
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(video.id)}
                className="absolute -top-2 -left-2 w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {video.name}
              </h3>
              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                <span>{formatFileSize(video.size)}</span>
                {video.duration && <span>{formatDuration(video.duration)}</span>}
                {video.dimensions && (
                  <span>{video.dimensions.width} × {video.dimensions.height}</span>
                )}
                <span>{formatDate(video.lastModified)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(video);
              }}
              className="p-2"
            >
              <Eye className="w-4 h-4" />
            </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        'group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden',
        isSelected && 'ring-2 ring-blue-500'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onPreview(video)}
    >
      <div className="relative aspect-video bg-gray-200">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loading size="md" />
          </div>
        )}
        <video
          ref={videoRef}
          src={video.url || URL.createObjectURL(video.file)}
          className={cn(
            'w-full h-full object-cover transition-all duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            'group-hover:scale-105'
          )}
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          muted
          preload="metadata"
          onClick={() => onPreview(video)}
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="secondary"
            size="lg"
            className={cn(
              'p-4 bg-black/50 hover:bg-black/70 text-white border-0 transition-opacity duration-200',
              showActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
        </div>
        
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onClick={(e) => {
            e.stopPropagation();
          }}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(video.id);
          }}
          className="absolute top-3 left-3 w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 z-10"
        />
        
        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-black/70 text-white text-xs">
              {formatDuration(video.duration)}
            </Badge>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className={cn(
          'absolute top-3 right-3 flex space-x-1 transition-opacity duration-200',
          showActions ? 'opacity-100' : 'opacity-0'
        )}>
          <Button
            variant="secondary"
            size="sm"
            className="p-2 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(video);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Video Info Overlay */}
        <div className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 transition-opacity duration-200',
          showActions ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="text-white">
            <p className="text-sm font-medium truncate">{video.name}</p>
            <div className="flex items-center justify-between text-xs mt-1">
              <span>{formatFileSize(video.size)}</span>
              {video.dimensions && (
                <span>{video.dimensions.width} × {video.dimensions.height}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose }) => {
  const { filter, setFilter, sort, setSort } = useMediaStore();

  const sizeOptions = [
    { label: '全部大小', value: 'all' },
    { label: '小于 50MB', value: 'small' },
    { label: '50MB - 200MB', value: 'medium' },
    { label: '大于 200MB', value: 'large' }
  ];

  const durationOptions = [
    { label: '全部时长', value: 'all' },
    { label: '小于 1分钟', value: 'short' },
    { label: '1-5分钟', value: 'medium' },
    { label: '大于 5分钟', value: 'long' }
  ];

  const sortingOptions = [
    { label: '文件名', value: 'name' as const },
    { label: '文件大小', value: 'size' as const },
    { label: '修改日期', value: 'date' as const }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="筛选和排序">
      <div className="space-y-6">
        {/* 文件大小筛选 */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">文件大小</h3>
          <div className="space-y-2">
            {sizeOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="size"
                  value={option.value}
                  checked={false}
                  onChange={(e) => {}}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 视频时长筛选 */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">视频时长</h3>
          <div className="space-y-2">
            {durationOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="duration"
                  value={option.value}
                  checked={false}
                  onChange={(e) => {}}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 排序选项 */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">排序方式</h3>
          <div className="space-y-2">
            {sortingOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="sortBy"
                  value={option.value}
                  checked={sort.sortBy === option.value}
                  onChange={(e) => setSort({ ...sort, sortBy: e.target.value as SortOptions['sortBy'] })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 排序方向 */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">排序方向</h3>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="sortOrder"
                value="asc"
                checked={sort.sortOrder === 'asc'}
                onChange={(e) => setSort({ ...sort, sortOrder: e.target.value as 'asc' | 'desc' })}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <SortAsc className="w-4 h-4 ml-2 mr-1" />
              <span className="text-sm text-gray-700">升序</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="sortOrder"
                value="desc"
                checked={sort.sortOrder === 'desc'}
                onChange={(e) => setSort({ ...sort, sortOrder: e.target.value as 'asc' | 'desc' })}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <SortDesc className="w-4 h-4 ml-2 mr-1" />
              <span className="text-sm text-gray-700">降序</span>
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>
          取消
        </Button>
        <Button onClick={onClose}>
          应用筛选
        </Button>
      </div>
    </Modal>
  );
};

interface VideoPreviewProps {
  video: MediaFile | null;
  isOpen: boolean;
  onClose: () => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ video, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const currentBlobUrlRef = useRef<string | null>(null);

  // 创建和清理blob URL - 优化版本
  useEffect(() => {
    let isMounted = true;
    let cleanupTimer: NodeJS.Timeout | null = null;
    
    // 清理函数 - 增强版本
    const cleanupBlobUrl = (immediate = false) => {
      if (currentBlobUrlRef.current) {
        const urlToCleanup = currentBlobUrlRef.current;
        
        const performCleanup = () => {
          try {
            URL.revokeObjectURL(urlToCleanup);
            console.log('🗑️ Blob URL cleaned up:', urlToCleanup.substring(0, 30) + '...');
          } catch (error) {
            console.warn('⚠️ Error cleaning up blob URL:', error);
          }
        };
        
        if (immediate) {
          performCleanup();
        } else {
          // 延迟清理以避免竞态条件
          cleanupTimer = setTimeout(performCleanup, 100);
        }
        
        currentBlobUrlRef.current = null;
      }
    };

    // 先清理之前的URL
    cleanupBlobUrl(true);
    setVideoUrl(null);

    if (video?.file && isMounted) {
      try {
        // 验证文件对象和类型
        if (!video.file || typeof video.file !== 'object' || !('size' in video.file) || !('type' in video.file)) {
          throw new Error('Invalid file object');
        }
        
        // 验证文件类型
        if (!video.file.type.startsWith('video/')) {
          throw new Error(`Invalid file type: ${video.file.type}`);
        }
        
        // 验证文件大小（限制为500MB）
        const maxSize = 500 * 1024 * 1024; // 500MB
        if (video.file.size > maxSize) {
          throw new Error(`File too large: ${video.file.size} bytes (max: ${maxSize})`);
        }
        
        const url = video.url || URL.createObjectURL(video.file);
        
        if (isMounted) {
          currentBlobUrlRef.current = url;
          setVideoUrl(url);
          console.log('🔗 New blob URL created:', url.substring(0, 30) + '...', `(${video.file.type}, ${(video.file.size / 1024 / 1024).toFixed(2)}MB)`);
        } else {
          // 如果组件已卸载，立即清理
          URL.revokeObjectURL(url);
        }
      } catch (error) {
        console.error('❌ Failed to create blob URL:', error);
        if (isMounted) {
          setVideoUrl(null);
          currentBlobUrlRef.current = null;
        }
      }
    }
    
    return () => {
      isMounted = false;
      if (cleanupTimer) {
        clearTimeout(cleanupTimer);
      }
      cleanupBlobUrl(true);
      setVideoUrl(null);
    };
  }, [video]);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
      setShowControls(true);
      setVideoDimensions(null);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    } else if (isOpen && video) {
      // 重置状态
      setCurrentTime(0);
      setIsPlaying(false);
      setShowControls(true);
      setVideoDimensions(null);
      
      // 自动播放逻辑 - 延迟执行确保视频元素完全加载
      const attemptAutoPlay = async () => {
        if (!videoRef.current || !videoUrl) return;
        
        // 等待视频元素准备就绪
        const waitForReady = () => {
          return new Promise<void>((resolve) => {
            if (videoRef.current && videoRef.current.readyState >= 2) {
              resolve();
            } else {
              const handleCanPlay = () => {
                videoRef.current?.removeEventListener('canplay', handleCanPlay);
                resolve();
              };
              videoRef.current?.addEventListener('canplay', handleCanPlay);
            }
          });
        };
        
        try {
          await waitForReady();
          
          // 重置视频到开始位置
          videoRef.current.currentTime = 0;
          setCurrentTime(0);
          
          // 首先尝试有声播放
          videoRef.current.muted = false;
          videoRef.current.volume = volume;
          
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            setIsPlaying(true);
            setIsMuted(false);
            showControlsTemporarily();
            console.log('✅ Auto-play successful with sound');
          }
        } catch (error) {
          console.log('⚠️ Auto-play with sound failed, trying muted:', error);
          
          // 如果有声播放失败，尝试静音播放
          try {
            if (videoRef.current) {
              videoRef.current.muted = true;
              const mutedPlayPromise = videoRef.current.play();
              if (mutedPlayPromise !== undefined) {
                await mutedPlayPromise;
                setIsPlaying(true);
                setIsMuted(true);
                showControlsTemporarily();
                console.log('✅ Auto-play successful muted');
              }
            }
          } catch (mutedError) {
            console.log('❌ Auto-play completely failed:', mutedError);
            setIsPlaying(false);
            setIsMuted(false);
            showControlsTemporarily();
          }
        }
      };
      
      // 延迟执行以确保视频元素完全加载
      const timer = setTimeout(attemptAutoPlay, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, video, volume]);

  // 监听窗口尺寸变化，重新计算视频尺寸
  useEffect(() => {
    if (!isOpen || !videoDimensions) return;
    
    const handleResize = () => {
      // 触发重新渲染以应用新的尺寸计算
      if (videoRef.current) {
        const event = new Event('resize');
        window.dispatchEvent(event);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, videoDimensions]);

  const togglePlay = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        videoRef.current.pause();
        // 状态将通过handleVideoPause事件处理器更新
        console.log('🎵 Video paused');
      } else {
        // 确保音量和静音状态正确
        videoRef.current.muted = isMuted;
        videoRef.current.volume = isMuted ? 0 : volume;
        
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          // 状态将通过handleVideoPlay事件处理器更新
          console.log('🎵 Video playing');
        }
      }
    } catch (error) {
      console.error('❌ Error toggling play:', error);
      // 如果播放失败，尝试静音播放
      try {
        if (videoRef.current && !isPlaying) {
          videoRef.current.muted = true;
          const mutedPlayPromise = videoRef.current.play();
          if (mutedPlayPromise !== undefined) {
            await mutedPlayPromise;
            setIsMuted(true);
            console.log('🔇 Video playing muted as fallback');
          }
        }
      } catch (mutedError) {
        console.error('❌ Error playing muted:', mutedError);
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      
      // 如果取消静音，恢复之前的音量
      if (!newMutedState) {
        videoRef.current.volume = volume;
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && !isNaN(videoRef.current.currentTime) && isFinite(videoRef.current.currentTime)) {
      setCurrentTime(videoRef.current.currentTime);
      
      // 如果视频播放到结尾，自动暂停
      if (videoRef.current.currentTime >= videoRef.current.duration && videoRef.current.duration > 0) {
        setIsPlaying(false);
        setCurrentTime(videoRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      // 设置初始音量
      videoRef.current.volume = volume;
      
      // 设置预加载策略
      videoRef.current.preload = 'metadata';
      
      // 获取视频原始尺寸
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      if (videoWidth > 0 && videoHeight > 0) {
        setVideoDimensions({ width: videoWidth, height: videoHeight });
        console.log('📐 Video dimensions:', videoWidth, 'x', videoHeight);
      }
      
      // 确保时长是有效的
      if (!isNaN(videoRef.current.duration) && isFinite(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
        console.log('📊 Metadata loaded, duration:', videoRef.current.duration);
      } else {
        console.log('⚠️ Invalid duration in metadata:', videoRef.current.duration);
      }
      
      // 优化播放体验
      if (videoRef.current.readyState >= 2) {
        console.log('✅ Video ready for playback');
      }
    }
  };
  
  // 处理视频加载错误
  const handleVideoError = () => {
    if (videoRef.current) {
      const error = videoRef.current.error;
      
      console.error('❌ Video loading error:', {
        code: error?.code,
        message: error?.message,
        networkState: videoRef.current.networkState,
        readyState: videoRef.current.readyState
      });
      
      // 重置状态
      setIsPlaying(false);
      setVideoDimensions(null);
      setCurrentTime(0);
      setDuration(0);
    }
  };
  
  // 处理视频加载开始
  const handleLoadStart = () => {
    console.log('🔄 Video loading started');
    setCurrentTime(0);
    setDuration(0);
  };
  
  // 处理视频可以播放
  const handleCanPlay = () => {
    console.log('▶️ Video can start playing');
  };
  
  // 处理视频缓冲等待
  const handleWaiting = () => {
    console.log('⏳ Video buffering...');
  };
  
  // 处理视频缓冲完成
  const handleCanPlayThrough = () => {
    console.log('🚀 Video fully buffered and ready');
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current && !isNaN(time) && isFinite(time) && duration > 0) {
      // 确保时间在有效范围内
      const clampedTime = Math.max(0, Math.min(time, duration));
      videoRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
      showControlsTemporarily();
      console.log('🎯 Seeking to:', clampedTime);
    }
  };

  const handleFullscreen = async () => {
    if (!videoRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        // 进入全屏
        if (videoRef.current.requestFullscreen) {
          await videoRef.current.requestFullscreen();
        } else if ((videoRef.current as any).webkitRequestFullscreen) {
          await (videoRef.current as any).webkitRequestFullscreen();
        } else if ((videoRef.current as any).msRequestFullscreen) {
          await (videoRef.current as any).msRequestFullscreen();
        }
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    showControlsTemporarily();
    console.log('▶️ Video play event triggered');
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
    showControlsTemporarily();
    console.log('⏸️ Video pause event triggered');
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setCurrentTime(duration);
    showControlsTemporarily();
    console.log('🎬 Video ended');
  };

  const handleDurationChange = () => {
    if (videoRef.current && !isNaN(videoRef.current.duration) && isFinite(videoRef.current.duration)) {
      setDuration(videoRef.current.duration);
      console.log('⏱️ Duration updated:', videoRef.current.duration);
    }
  };

  const formatTime = (seconds: number) => {
    // 处理无效时间值
    if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
      return '0:00';
    }
    
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
    }, 4000); // 延长显示时间到4秒
  };

  const handleMouseMove = () => {
    showControlsTemporarily();
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    togglePlay();
    showControlsTemporarily();
    // 点击视频区域时关闭更多选项菜单
    if (showMoreOptions) {
      setShowMoreOptions(false);
    }
  };

  // 计算视频宽高比 - 让CSS完全控制尺寸
  const calculateOptimalVideoSize = () => {
    if (!videoDimensions) return { aspectRatio: '16/9' };
    
    const { width: videoWidth, height: videoHeight } = videoDimensions;
    
    // 只返回宽高比，让CSS完全控制视频尺寸
    return {
      aspectRatio: `${videoWidth}/${videoHeight}`
    };
  };

  if (!video) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 max-w-[90vw] max-h-[85vh] w-full h-full">
      <div 
        className="h-full relative"
        onMouseMove={handleMouseMove}
      >
        {/* 响应式视频容器 - 完全贴合视频内容 */}
        <div className="relative w-full h-full transform transition-all duration-500 ease-out animate-in zoom-in-95 slide-in-from-bottom-4 flex items-center justify-center">
          {videoUrl && (
            <video
              ref={videoRef}
              src={videoUrl}
              className="object-contain rounded-xl sm:rounded-2xl block shadow-2xl border border-white/10 bg-black/5 backdrop-blur-sm"
              style={{
                aspectRatio: calculateOptimalVideoSize().aspectRatio,
                maxWidth: '85vw',
                maxHeight: '75vh',
                width: '100%',
                height: '100%',
                display: 'block'
              }}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onCanPlay={handleCanPlay}
              onLoadStart={handleLoadStart}
              onWaiting={handleWaiting}
              onCanPlayThrough={handleCanPlayThrough}
              onError={handleVideoError}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onEnded={handleVideoEnded}
              onDurationChange={handleDurationChange}
              onClick={handleVideoClick}
              controls={false}
              playsInline={true}
              preload="metadata"
            />
          )}
          
          {/* 苹果风格视频控制栏 */}
          <div className={cn(
            'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-2 sm:p-3 md:p-4 transition-all duration-500 ease-out rounded-b-xl sm:rounded-b-2xl',
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}>
            {/* 苹果风格进度条 */}
            <div className="mb-4">
              <div className="relative group">
                <input
                    type="range"
                    min={0}
                    max={duration > 0 ? duration : 100}
                    value={duration > 0 ? currentTime : 0}
                    onChange={handleSeek}
                    disabled={duration <= 0}
                    className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer slider transition-all duration-200 group-hover:h-2 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: duration > 0 
                        ? `linear-gradient(to right, #007AFF 0%, #007AFF ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
                        : 'rgba(255,255,255,0.3)'
                    }}
                />

              </div>
            </div>
            
            {/* 苹果风格控制按钮 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                {/* 主播放按钮 - 苹果风格 */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlay}
                    className="text-white hover:bg-white/20 p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg bg-white/10 backdrop-blur-sm border border-white/20 group-hover:border-white/40 active:scale-95"
                  >
                    <div className="transition-transform duration-200">
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </div>
                  </Button>
                  {/* 播放状态指示器 */}
                  <div className={cn(
                    "absolute -top-1 -right-1 w-3 h-3 rounded-full transition-all duration-300",
                    isPlaying ? "bg-green-400 shadow-lg shadow-green-400/50" : "bg-gray-400"
                  )} />
                </div>
                
                {/* 音量控制 */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/15 p-2.5 rounded-full transition-all duration-300 hover:scale-110 bg-white/5 backdrop-blur-sm active:scale-95"
                    >
                      <div className="transition-all duration-200">
                        {isMuted ? (
                          <VolumeX className="w-5 h-5 text-red-400" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </div>
                    </Button>
                    {/* 音量状态指示器 */}
                    {!isMuted && (
                      <div className="absolute -top-0.5 -right-0.5 flex space-x-0.5">
                        <div className={cn(
                          "w-1 h-1 bg-blue-400 rounded-full animate-pulse",
                          volume > 0.3 ? "opacity-100" : "opacity-30"
                        )} />
                        <div className={cn(
                          "w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-75",
                          volume > 0.6 ? "opacity-100" : "opacity-30"
                        )} />
                        <div className={cn(
                          "w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-150",
                          volume > 0.9 ? "opacity-100" : "opacity-30"
                        )} />
                      </div>
                    )}
                  </div>
                  
                  {/* 音量滑块 - 苹果风格 */}
                  <div className="hidden sm:block w-16 md:w-24 group">
                    <div className="relative">
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={(e) => {
                          const newVolume = parseFloat(e.target.value);
                          setVolume(newVolume);
                          if (videoRef.current) {
                            videoRef.current.volume = newVolume;
                            if (newVolume === 0) {
                              setIsMuted(true);
                              videoRef.current.muted = true;
                            } else if (isMuted) {
                              setIsMuted(false);
                              videoRef.current.muted = false;
                            }
                          }
                        }}
                        className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer volume-slider transition-all duration-200 group-hover:h-1.5"
                        style={{
                          background: `linear-gradient(to right, #007AFF 0%, #007AFF ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%, rgba(255,255,255,0.3) 100%)`
                        }}
                      />

                    </div>
                  </div>
                </div>
                
                {/* 时间显示 - 苹果风格 */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="text-white text-xs sm:text-sm font-mono bg-black/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/10 shadow-lg">
                    <span className="text-blue-400">{formatTime(currentTime)}</span>
                    <span className="text-white/60 mx-0.5 sm:mx-1">/</span>
                    <span className="text-white/80">{formatTime(duration)}</span>
                  </div>
                  {/* 播放进度指示器 */}
                  <div className="hidden md:flex items-center space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1 h-3 rounded-full transition-all duration-300",
                          duration > 0 && i < (currentTime / duration) * 5
                            ? "bg-blue-400 shadow-sm shadow-blue-400/50"
                            : "bg-white/20"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* 右侧控制按钮 */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* 全屏按钮 */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFullscreen}
                    className="text-white hover:bg-white/15 p-2.5 rounded-full transition-all duration-300 hover:scale-110 bg-white/5 backdrop-blur-sm active:scale-95"
                    title={document.fullscreenElement ? "退出全屏" : "全屏播放"}
                  >
                    <div className="transition-transform duration-200">
                      {document.fullscreenElement ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 15v4.5M15 15h4.5M15 15l5.25 5.25" />
                        </svg>
                      ) : (
                        <Maximize className="w-5 h-5" />
                      )}
                    </div>
                  </Button>
                  {/* 全屏状态指示器 */}
                  {document.fullscreenElement && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  )}
                </div>
                
                {/* 更多选项按钮 */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    className="text-white hover:bg-white/15 p-2.5 rounded-full transition-all duration-300 hover:scale-110 bg-white/5 backdrop-blur-sm active:scale-95"
                    title="更多选项"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </Button>
                  
                  {/* 更多选项菜单 */}
                  {showMoreOptions && (
                    <div className="absolute right-0 bottom-full mb-2 bg-black/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl p-2 min-w-[160px] animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.playbackRate = videoRef.current.playbackRate === 1 ? 1.5 : 1;
                            }
                            setShowMoreOptions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                        >
                          播放速度: {videoRef.current?.playbackRate === 1.5 ? '1.5x' : '1x'}
                        </button>
                        <button
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.currentTime = 0;
                              setCurrentTime(0);
                            }
                            setShowMoreOptions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                        >
                          重新开始
                        </button>
                        <button
                          onClick={() => {
                            const canvas = document.createElement('canvas');
                            const ctx = canvas.getContext('2d');
                            if (videoRef.current && ctx) {
                              canvas.width = videoRef.current.videoWidth;
                              canvas.height = videoRef.current.videoHeight;
                              ctx.drawImage(videoRef.current, 0, 0);
                              const link = document.createElement('a');
                              link.download = `${video?.name || 'video'}_screenshot.png`;
                              link.href = canvas.toDataURL();
                              link.click();
                            }
                            setShowMoreOptions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                        >
                          截图保存
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
          {/* 苹果风格视频信息栏 - 优化布局 */}
          <div className={cn(
            'absolute top-1 sm:top-2 left-1 sm:left-2 right-1 sm:right-2 transition-all duration-500 ease-out',
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          )}>
            <div className="bg-black/20 backdrop-blur-xl rounded-lg sm:rounded-xl border border-white/5 p-2 sm:p-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate text-xs sm:text-sm mb-1">{video.name}</h3>
                  <div className="flex items-center space-x-2 sm:space-x-3 text-xs text-white/60">
                    <span className="bg-white/10 px-1 sm:px-1.5 py-0.5 rounded text-xs">{formatFileSize(video.size)}</span>
                    {video.duration && <span className="bg-white/10 px-1 sm:px-1.5 py-0.5 rounded text-xs">{formatTime(video.duration)}</span>}
                    {video.dimensions && (
                      <span className="hidden sm:inline bg-white/10 px-1.5 py-0.5 rounded text-xs">{video.dimensions.width} × {video.dimensions.height}</span>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose}
                  className="text-white hover:bg-white/15 p-1 sm:p-1.5 rounded-full transition-all duration-300 hover:scale-105 bg-white/10 backdrop-blur-sm ml-2 sm:ml-3"
                  title="关闭"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
      </div>
    </Modal>
  );
};

const Videos: React.FC = () => {
  const {
    getVideoFiles,
    selectedFiles,
    viewMode,
    isLoading,
    searchQuery,
    loadFiles,
    addFilesWithProgress,
    addFilesWithFolder,
    uploadFilesToApi,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    setViewMode,
    setSearchQuery,
    removeSelectedFiles,
    folders,
    loadVideoFolders,
    folderView,
    setCurrentFolder,
    getCurrentFolderFiles
  } = useMediaStore();

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<MediaFile | null>(null);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);
  const [folderProgress, setFolderProgress] = useState({ current: 0, total: 0, path: '' });
  const [localCurrentFolder, setLocalCurrentFolder] = useState<string | null>(null);
  


  // 计算当前文件夹路径
  const currentFolderPath = folderView.currentFolder || localCurrentFolder;

  const videos = getVideoFiles();
  const selectedCount = selectedFiles.length;
  const totalSize = videos.reduce((sum, file) => sum + file.size, 0);

  // 获取当前文件夹名称
  const getCurrentFolderName = () => {
    if (!currentFolderPath) return '';
    return currentFolderPath.split('/').pop() || currentFolderPath.split('\\').pop() || currentFolderPath;
  };

  // 处理文件夹点击
  const handleFolderClick = async (folderPath: string) => {
    try {
      setIsLoadingFolder(true);
      setLocalCurrentFolder(folderPath);
      setCurrentFolder(folderPath);
      clearSelection();
      
      // 直接切换到文件视图，不需要重新选择文件夹
      // 文件已经在存储中，通过folderPath筛选即可
      console.log('🎬 [Videos] 切换到文件夹视图:', folderPath);
    } catch (error) {
      console.error('切换文件夹视图失败:', error);
    } finally {
      setIsLoadingFolder(false);
    }
  };

  // 返回文件夹视图
  const handleBackToFolders = () => {
    setLocalCurrentFolder(null);
    setCurrentFolder(null);
    clearSelection();
    loadVideoFolders();
  };

  // 初始化加载 - 每次进入页面时自动刷新数据
  useEffect(() => {
    const refreshData = async () => {
      try {
        await loadFiles();
        await loadVideoFolders();
        console.log('视频数据刷新完成');
      } catch (error) {
        console.error('视频数据刷新失败:', error);
      }
    };
    
    refreshData();
  }, [loadFiles, loadVideoFolders]);

  // 添加页面可见性变化时的自动刷新
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadFiles();
        loadVideoFolders();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loadFiles, loadVideoFolders]);

  // 监听视图切换
  useEffect(() => {
    if (folderView.currentView === 'folders') {
      loadVideoFolders();
    }
  }, [folderView.currentView, loadVideoFolders]);

  const handleFileUpload = async () => {
    try {
      const files = await selectFiles({
        types: [{
          description: 'Videos',
          accept: {
            'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
          }
        }],
        multiple: true
      });
      
      if (files.length > 0) {
        await uploadFilesToApi(files, 'video', (current, total, fileName) => {
          console.log(`上传进度: ${current}/${total} - ${fileName}`);
        });
        
        // 重新从API加载视频列表
        await loadFiles();
        await loadVideoFolders();
        
        alert(`成功上传 ${files.length} 个视频到服务器！`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('用户取消')) {
        return;
      }
      console.error('视频上传失败:', error);
      alert('视频上传到服务器失败，请重试。');
    }
  };

  const handleFolderSelect = async () => {
    console.log('🎬 [Videos] handleFolderSelect 开始执行');
    try {
      setIsLoadingFolder(true);
      setFolderProgress({ current: 0, total: 0, path: '' });
      console.log('🎬 [Videos] 设置加载状态为 true');
      
      // 不再检查浏览器支持，因为已经有fallback方案
      
      console.log('🎬 [Videos] 调用 selectDirectoryAndGetVideos');
      const result = await selectDirectoryAndGetVideos((current, total, path) => {
        setFolderProgress({ current, total, path });
      });
      
      console.log('🎬 [Videos] selectDirectoryAndGetVideos 结果:', {
        directoryName: result.directoryName,
        filesCount: result.files.length,
        files: result.files.map(f => ({ name: f.name, type: f.type, size: f.size }))
      });
      
      if (result.files.length > 0) {
        console.log('🎬 [Videos] 开始上传文件到API服务器');
        // 使用API上传而不是本地存储
        await uploadFilesToApi(
          result.files, 
          'video',
          (current, total, fileName) => {
            setFolderProgress({ 
              current, 
              total, 
              path: `正在上传: ${fileName}` 
            });
          }
        );
        
        console.log('🎬 [Videos] 文件上传完成，开始刷新数据');
        console.log('🎬 [Videos] 调用 loadFiles()');
        await loadFiles();
        console.log('🎬 [Videos] 调用 loadVideoFolders()');
        await loadVideoFolders(); // 刷新文件夹列表以显示新上传的文件夹
        
        console.log('🎬 [Videos] 数据刷新完成，当前 folders 状态:', folders);
        console.log('🎬 [Videos] 当前 folderView 状态:', folderView);
        
        alert(`成功从文件夹 "${result.directoryName}" 上传了 ${result.files.length} 个视频到服务器！`);
      } else {
        console.log('🎬 [Videos] 文件夹中没有找到视频文件');
        alert(`文件夹 "${result.directoryName}" 中没有找到视频文件。`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('用户取消')) {
        console.log('🎬 [Videos] 用户取消了文件夹选择');
        // 用户取消选择，不显示错误
        return;
      }
      console.error('🎬 [Videos] 文件夹选择失败:', error);
      alert('文件夹选择失败，请重试。');
    } finally {
      console.log('🎬 [Videos] handleFolderSelect 执行完成，设置加载状态为 false');
      setIsLoadingFolder(false);
      setFolderProgress({ current: 0, total: 0, path: '' });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedCount === 0) return;
    
    const confirmed = window.confirm(`确定要删除选中的 ${selectedCount} 个视频吗？此操作不可撤销。`);
    if (!confirmed) return;
    
    try {
      await removeSelectedFiles();
      
      // 智能导航逻辑：如果删除后当前文件夹为空且在文件视图中，返回文件夹视图
      if (folderView.currentView === 'files' && currentFolderPath) {
        const remainingVideos = videos.filter(video => !selectedFiles.includes(video.id));
        if (remainingVideos.length === 0) {
          console.log('文件夹已空，返回文件夹视图');
          handleBackToFolders();
        }
      }
    } catch (error) {
      console.error('删除视频失败:', error);
      alert('删除视频失败，请重试。');
    }
  };

  const handleSelectAll = () => {
    if (selectedCount === videos.length) {
      clearSelection();
    } else {
      selectAllFiles();
    }
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader
          title={folderView.currentView === 'folders' ? '视频库' : `视频库 - ${getCurrentFolderName()}`}
          subtitle={
            folderView.currentView === 'folders'
              ? `共 ${folders.length} 个文件夹`
              : `共 ${videos.length} 个视频${selectedCount > 0 ? `，已选择 ${selectedCount} 个` : ''}`
          }
          action={
            <div className="flex items-center space-x-3">
              {folderView.currentView === 'files' && (
                <Button
                  variant="secondary"
                  onClick={() => setShowFilterPanel(true)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  筛选
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => {
                  loadFiles();
                  loadVideoFolders();
                }}
                disabled={isLoading}
              >
                <Search className="w-4 h-4 mr-2" />
                刷新
              </Button>
            </div>
          }
        />

        {/* Breadcrumb Navigation */}
        {folderView.currentView === 'files' && currentFolderPath && (
          <div className="mb-4">
            <Breadcrumb
              items={[
                { label: '视频库', onClick: handleBackToFolders },
                { label: getCurrentFolderName() }
              ]}
            />
          </div>
        )}

        {/* Search and Controls - Only show in files view */}
        {folderView.currentView === 'files' && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="搜索视频..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>
          
          <div className="flex items-center space-x-3">
            {selectedCount > 0 && (
              <div className="flex items-center space-x-2">
                <Badge variant="primary">
                  已选择 {selectedCount} 个
                </Badge>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  取消选择
                </Button>
                <Button variant="danger" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </Button>
              </div>
            )}
            
            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedCount === videos.length ? '取消全选' : '全选'}
            </Button>
          </div>
          </div>
        )}

        {/* Folder View */}
        {folderView.currentView === 'folders' && (
          <FolderView
            folders={folders}
            onFolderClick={handleFolderClick}
            loading={isLoading}
          />
        )}

        {/* Folder Loading Progress */}
        {isLoadingFolder && folderProgress.total > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                正在加载文件夹中的视频...
              </span>
              <span className="text-sm text-blue-700">
                {folderProgress.current} / {folderProgress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(folderProgress.current / folderProgress.total) * 100}%` }}
              ></div>
            </div>
            {folderProgress.path && (
              <p className="text-xs text-blue-600 truncate">
                当前文件: {folderProgress.path}
              </p>
            )}
          </div>
        )}

        {/* Videos Grid/List - Only show in files view */}
        {folderView.currentView === 'files' && (
          isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loading size="lg" text="加载视频中..." />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? '未找到匹配的视频' : '还没有视频'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? '尝试调整搜索条件' : '开始添加您的第一个视频'}
              </p>
              {!searchQuery && (
                <Button onClick={handleFolderSelect} disabled={isLoadingFolder}>
                  <Folder className="w-4 h-4 mr-2" />
                  {isLoadingFolder ? '加载中...' : '选择文件夹'}
                </Button>
              )}
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
            )}>
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isSelected={selectedFiles.includes(video.id)}
                  onSelect={toggleFileSelection}
                  onPreview={setPreviewVideo}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )
        )}

        {/* Filter Panel */}
        <FilterPanel
          isOpen={showFilterPanel}
          onClose={() => setShowFilterPanel(false)}
        />

        {/* Video Preview */}
        <VideoPreview
          video={previewVideo}
          isOpen={!!previewVideo}
          onClose={() => setPreviewVideo(null)}
        />
      </PageContainer>
    </Layout>
  );
};

export default Videos;