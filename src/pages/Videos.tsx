import React, { useEffect, useState, useRef } from 'react';
import { Grid, List, Filter, SortAsc, SortDesc, Upload, Eye, Download, Trash2, MoreHorizontal, Play, Pause, Volume2, VolumeX, Maximize, Video, Folder } from 'lucide-react';
import { Layout, PageContainer, PageHeader } from '../components/layout';
import { Button, Card, CardContent, Modal, Badge, SearchInput, Loading } from '../components/ui';
import { useMediaStore } from '../store/mediaStore';
import { MediaFile, SortOptions } from '../types';
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
                  src={URL.createObjectURL(video.file)}
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
                    onClick={togglePlay}
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
                onClick={() => onPreview(video)}
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
    >
      <div className="relative aspect-video bg-gray-200">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loading size="md" />
          </div>
        )}
        <video
          ref={videoRef}
          src={URL.createObjectURL(video.file)}
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
          onChange={() => onSelect(video.id)}
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen]);

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

  if (!video) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" className="bg-black/95">
      <div 
        className="flex items-center justify-center min-h-screen p-4 relative"
        onMouseMove={handleMouseMove}
      >
        <div className="max-w-6xl max-h-full relative">
          <video
            ref={videoRef}
            src={URL.createObjectURL(video.file)}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={togglePlay}
          />
          
          {/* Video Controls */}
          <div className={cn(
            'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300',
            showControls ? 'opacity-100' : 'opacity-0'
          )}>
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </Button>
                
                <div className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Download className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Video Info */}
        <div className={cn(
          'absolute bottom-4 left-4 right-4 transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}>
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{video.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>{formatFileSize(video.size)}</span>
                    {video.duration && <span>{formatTime(video.duration)}</span>}
                    {video.dimensions && (
                      <span>{video.dimensions.width} × {video.dimensions.height}</span>
                    )}
                    <span>{formatDate(video.lastModified)}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="secondary" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    下载
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Modal>
  );
};

const Videos: React.FC = () => {
  const {
    filteredFiles,
    selectedFiles,
    viewMode,
    isLoading,
    searchQuery,
    loadFiles,
    addFilesWithProgress,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    setViewMode,
    setSearchQuery,
    removeSelectedFiles
  } = useMediaStore();

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<MediaFile | null>(null);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);
  const [folderProgress, setFolderProgress] = useState({ current: 0, total: 0, path: '' });

  const videos = filteredFiles.filter(file => file.type === 'video');
  const selectedCount = selectedFiles.length;

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleFileUpload = async () => {
    try {
      const files = await selectFiles({
        types: [{
          description: 'Videos',
          accept: {
            'video/*': ['.mp4', '.webm', '.ogg', '.mov', '.avi']
          }
        }],
        multiple: true
      });
      
      if (files.length > 0) {
        await addFilesWithProgress(files, (current, total, fileName) => {
          // Progress callback for individual file uploads
        });
      }
      loadFiles();
    } catch (error) {
      console.error('文件上传失败:', error);
    }
  };

  const handleFolderSelect = async () => {
    try {
      setIsLoadingFolder(true);
      setFolderProgress({ current: 0, total: 0, path: '' });
      
      if (!isDirectoryPickerSupported()) {
        alert('您的浏览器不支持文件夹选择功能，请使用最新版本的Chrome、Edge或Firefox浏览器。');
        return;
      }
      
      const result = await selectDirectoryAndGetVideos((current, total, path) => {
        setFolderProgress({ current, total, path });
      });
      
      if (result.files.length > 0) {
        // 使用带进度的添加方法
        await addFilesWithProgress(result.files, (current, total, fileName) => {
          setFolderProgress({ 
            current, 
            total, 
            path: `正在处理: ${fileName}` 
          });
        });
        
        loadFiles();
        
        alert(`成功从文件夹 "${result.directoryName}" 加载了 ${result.files.length} 个视频！`);
      } else {
        alert(`文件夹 "${result.directoryName}" 中没有找到视频文件。`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('用户取消')) {
        // 用户取消选择，不显示错误
        return;
      }
      console.error('文件夹选择失败:', error);
      alert('文件夹选择失败，请重试。');
    } finally {
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
          title="视频库"
          subtitle={`共 ${videos.length} 个视频${selectedCount > 0 ? `，已选择 ${selectedCount} 个` : ''}`}
          action={
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowFilterPanel(true)}
              >
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
              <Button
                variant="secondary"
                onClick={handleFolderSelect}
                disabled={isLoadingFolder}
              >
                <Folder className="w-4 h-4 mr-2" />
                {isLoadingFolder ? '加载中...' : '选择文件夹'}
              </Button>
              <Button onClick={handleFileUpload}>
                <Upload className="w-4 h-4 mr-2" />
                添加视频
              </Button>
            </div>
          }
        />

        {/* Search and Controls */}
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

        {/* Videos Grid/List */}
        {isLoading ? (
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