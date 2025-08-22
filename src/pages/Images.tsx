import React, { useEffect, useState } from 'react';
import { Grid, List, Filter, SortAsc, SortDesc, Search, Upload, Eye, Download, Trash2, MoreHorizontal, Image, Folder, ArrowLeft, Home, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout, PageContainer, PageHeader, GridLayout } from '../components/layout';
import { Button, Card, CardContent, Modal, Badge, SearchInput, Loading } from '../components/ui';
import { LazyImage } from '../components/ui/LazyImage';
import { FolderView } from '../components/FolderView';
import { Breadcrumb } from '../components/Breadcrumb';
import { useMediaStore } from '../store/mediaStore';
import { MediaFile, SortOptions } from '../types';
import { formatFileSize, formatDate, cn } from '../lib/utils';

interface ImageCardProps {
  image: MediaFile;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPreview: (image: MediaFile) => void;
  viewMode: 'grid' | 'list';
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  isSelected,
  onSelect,
  onPreview,
  viewMode
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showActions, setShowActions] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
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
              <LazyImage
                src={image.thumbnail || URL.createObjectURL(image.file)}
                alt={image.name}
                className="w-16 h-16 rounded-lg"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(image.id)}
                className="absolute -top-2 -left-2 w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {image.name}
              </h3>
              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                <span>{formatFileSize(image.size)}</span>
                <span>{image.dimensions?.width} × {image.dimensions?.height}</span>
                <span>{formatDate(image.lastModified)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPreview(image)}
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
      <div className="relative aspect-square">
        <LazyImage
          src={image.thumbnail || URL.createObjectURL(image.file)}
          alt={image.name}
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={() => onPreview(image)}
        />
        
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(image.id)}
          className="absolute top-3 left-3 w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 z-10"
        />
        
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
              onPreview(image);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Image Info Overlay */}
        <div className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 transition-opacity duration-200',
          showActions ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="text-white">
            <p className="text-sm font-medium truncate">{image.name}</p>
            <div className="flex items-center justify-between text-xs mt-1">
              <span>{formatFileSize(image.size)}</span>
              {image.dimensions && (
                <span>{image.dimensions.width} × {image.dimensions.height}</span>
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
    { label: '小于 1MB', value: 'small' },
    { label: '1MB - 10MB', value: 'medium' },
    { label: '大于 10MB', value: 'large' }
  ];

  const sortingOptions = [
    { label: '文件名', value: 'name' as const },
    { label: '文件大小', value: 'size' as const },
    { label: '修改日期', value: 'dateModified' as const },
    { label: '创建日期', value: 'dateCreated' as const }
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
                  checked={filter.size === option.value}
                  onChange={(e) => setFilter({ ...filter, size: e.target.value as 'small' | 'medium' | 'large' })}
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

interface ImagePreviewProps {
  image: MediaFile | null;
  images: MediaFile[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ image, images, currentIndex, isOpen, onClose, onNavigate }) => {
  if (!image || !images.length) return null;

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < images.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onNavigate(currentIndex + 1);
    }
  };

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  // 调试信息
  console.log('Debug: ImagePreview image object:', image);
  console.log('Debug: ImagePreview image.file:', image.file);
  console.log('Debug: ImagePreview image.file instanceof File:', image.file instanceof File);
  console.log('Debug: ImagePreview image.file type:', typeof image.file);
  console.log('Debug: ImagePreview image.file size:', image.file?.size);

  const handleDownload = () => {
    if (image.file && image.file instanceof File) {
      const url = URL.createObjectURL(image.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" className="bg-white/95 backdrop-blur-xl">
      {/* 主容器 - 苹果风格白色设计，无需滚动 */}
      <div className="flex flex-col lg:flex-row h-[75vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/80 hover:bg-gray-200/80 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
        
        {/* 左侧图片区域 */}
        <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
          {/* 加载指示器 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          
          {/* 左导航按钮 */}
          {canGoPrevious && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
            </button>
          )}
          
          {/* 右导航按钮 */}
          {canGoNext && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-gray-900 transition-colors" />
            </button>
          )}
          
          <img
            src={image.file && image.file instanceof File ? URL.createObjectURL(image.file) : ''}
            alt={image.name}
            className="relative z-10 max-w-full max-h-full object-contain rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto'
            }}
            onError={(e) => {
              console.error('Image load error:', e);
              console.error('Failed to load image:', image.file);
            }}
            onLoad={(e) => {
               console.log('Image loaded successfully:', image.name);
               // 隐藏加载指示器
               const loader = e.currentTarget.parentElement?.querySelector('.animate-spin') as HTMLElement;
               if (loader) {
                 loader.style.display = 'none';
               }
             }}
          />
        </div>
        
        {/* 右侧信息面板 - 苹果风格 */}
        <div className="lg:w-80 xl:w-96 bg-white border-l border-gray-100 flex flex-col">
          {/* 头部信息 */}
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 break-words">{image.name}</h2>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">图片详情</p>
              <p className="text-sm text-gray-500">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
          </div>
          
          {/* 详细信息 */}
          <div className="flex-1 p-5 space-y-5">
            {/* 基本信息卡片 */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-900 mb-3">基本信息</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">文件大小</span>
                  <span className="text-sm font-medium text-gray-900">{formatFileSize(image.size)}</span>
                </div>
                
                {image.dimensions && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">图片尺寸</span>
                    <span className="text-sm font-medium text-gray-900">{image.dimensions.width} × {image.dimensions.height}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">修改时间</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(image.lastModified)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">文件类型</span>
                  <span className="text-sm font-medium text-gray-900 uppercase">{image.name.split('.').pop() || 'Unknown'}</span>
                </div>
              </div>
            </div>
            
            {/* 快速操作 */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-900">快速操作</h3>
              
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                下载图片
              </button>
              
              <button
                onClick={() => {
                  // 可以添加更多操作，如编辑、分享等
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-all duration-200 active:scale-[0.98]"
              >
                <MoreHorizontal className="w-4 h-4" />
                更多操作
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const Images: React.FC = () => {
  const {
    filteredFiles,
    selectedFiles,
    viewMode,
    isLoading,
    searchQuery,
    folderView,
    folders,
    currentFolderPath,
    loadFiles,
    loadFolders,
    addFilesWithProgress,
    addFilesWithFolder,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,
    setViewMode,
    setSearchQuery,
    setCurrentFolder,
    getCurrentFolderFiles,
    removeSelectedFiles
  } = useMediaStore();

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [previewImage, setPreviewImage] = useState<MediaFile | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);
  const [folderProgress, setFolderProgress] = useState({ current: 0, total: 0, path: '' });

  // 根据当前视图模式获取对应的文件列表
  const images = folderView.currentView === 'folders' 
    ? filteredFiles.filter(file => file.type === 'image')
    : getCurrentFolderFiles().filter(file => file.type === 'image');
  
  // 根据当前视图模式计算正确的选中数量
  const selectedCount = folderView.currentView === 'folders'
    ? selectedFiles.length // 文件夹列表视图：显示全局选中数量
    : selectedFiles.filter(fileId => 
        images.some(img => img.id === fileId)
      ).length; // 文件夹内容视图：只计算当前文件夹中选中的图片数量

  useEffect(() => {
    loadFiles();
    loadFolders();
  }, [loadFiles, loadFolders]);

  const handleFileUpload = async () => {
    try {
      const { selectFiles } = await import('../lib/fileSystem');
      const files = await selectFiles({
        types: [{
          description: 'Images',
          accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
          }
        }],
        multiple: true
      });
      
      if (files.length > 0) {
        await addFilesWithProgress(files, (current, total, fileName) => {
          // Progress callback for individual file uploads
          console.log(`处理进度: ${current}/${total} - ${fileName}`);
        });
        
        // 重新加载文件和文件夹列表
        await loadFiles();
        await loadFolders();
        
        alert(`成功上传 ${files.length} 张图片！`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('用户取消')) {
        // 用户取消选择，不显示错误
        return;
      }
      console.error('文件上传失败:', error);
      alert('文件上传失败，请重试。');
    }
  };

  const handleFolderSelect = async () => {
    try {
      setIsLoadingFolder(true);
      setFolderProgress({ current: 0, total: 0, path: '' });
      
      const { selectDirectoryAndGetImages, isDirectoryPickerSupported } = await import('../lib/fileSystem');
      
      if (!isDirectoryPickerSupported()) {
        alert('您的浏览器不支持文件夹选择功能，请使用最新版本的Chrome、Edge或Firefox浏览器。');
        return;
      }
      
      const result = await selectDirectoryAndGetImages((current, total, path) => {
        setFolderProgress({ current, total, path });
      });
      
      if (result.files.length > 0) {
        // 使用带文件夹信息的添加方法
        await addFilesWithFolder(
          result.files, 
          result.directoryName,
          result.directoryName,
          (current, total, fileName) => {
            setFolderProgress({ 
              current, 
              total, 
              path: `正在处理: ${fileName}` 
            });
          }
        );
        
        // 重新加载文件和文件夹列表
        await loadFiles();
        await loadFolders();
        
        alert(`成功从文件夹 "${result.directoryName}" 加载了 ${result.files.length} 张图片！`);
      } else {
        alert(`文件夹 "${result.directoryName}" 中没有找到图片文件。`);
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

  const handleSelectAll = () => {
    // 根据当前视图模式判断是否全选
    if (selectedCount === images.length) {
      clearSelection();
    } else {
      selectAllFiles();
    }
  };

  const handleDeleteSelected = async () => {
    console.log('🔥 [Images] handleDeleteSelected 开始执行');
    console.log('🔥 [Images] selectedCount:', selectedCount);
    console.log('🔥 [Images] selectedFiles:', selectedFiles);
    
    if (selectedCount === 0) {
      console.log('🔥 [Images] 没有选中文件，退出删除');
      return;
    }
    
    const confirmed = window.confirm(`确定要删除选中的 ${selectedCount} 张图片吗？此操作不可撤销。`);
    console.log('🔥 [Images] 用户确认删除:', confirmed);
    
    if (!confirmed) {
      console.log('🔥 [Images] 用户取消删除操作');
      return;
    }
    
    try {
      // 保存当前视图状态，避免被loadFolders()影响
      const isInFileView = folderView.currentView === 'files';
      const currentFolder = currentFolderPath;
      
      console.log('🔥 [Images] 开始调用 removeSelectedFiles');
      await removeSelectedFiles();
      console.log('🔥 [Images] removeSelectedFiles 执行完成');
      
      // 智能导航逻辑：只在文件夹视图中生效
      if (isInFileView && currentFolder) {
        // 获取删除后当前文件夹的图片数量
        const remainingImages = getCurrentFolderFiles().filter(file => file.type === 'image');
        console.log('🔥 [Images] 删除后剩余图片数量:', remainingImages.length);
        
        // 如果当前文件夹没有图片了，返回文件夹页面
        if (remainingImages.length === 0) {
          console.log('🔥 [Images] 文件夹为空，返回文件夹页面');
          setCurrentFolder(null);
        } else {
          console.log('🔥 [Images] 文件夹还有图片，保持在当前页面');
          // 保持在当前页面，不做任何跳转
        }
      }
      
      // 重新加载文件夹列表，确保空文件夹被移除
      await loadFolders();
      console.log('🔥 [Images] 文件夹列表重新加载完成');
    } catch (error) {
      console.error('🔥 [Images] 删除图片失败:', error);
      alert('删除图片失败，请重试。');
    }
  };
  
  const handleFolderClick = (folderPath: string) => {
    setCurrentFolder(folderPath);
    clearSelection();
  };

  const handleBackToFolders = () => {
    setCurrentFolder(null);
    clearSelection();
  };

  const getCurrentFolderName = () => {
    if (!currentFolderPath) return '';
    const folder = folders.find(f => f.path === currentFolderPath);
    return folder?.name || '';
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader
          title={folderView.currentView === 'folders' ? '图片库' : '文件夹内容'}
          subtitle={
            folderView.currentView === 'folders'
              ? `共 ${folders.length} 个文件夹${selectedCount > 0 ? `，已选择 ${selectedCount} 张图片` : ''}`
              : `共 ${images.length} 张图片${selectedCount > 0 ? `，已选择 ${selectedCount} 张` : ''}`
          }
          action={
            <div className="flex items-center space-x-3">
              {folderView.currentView === 'files' && currentFolderPath && (
                <Breadcrumb
                  items={[
                    {
                      label: '图片库',
                      onClick: handleBackToFolders
                    },
                    {
                      label: getCurrentFolderName() || '未知文件夹'
                    }
                  ]}
                />
              )}
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
                onClick={handleFolderSelect}
                disabled={isLoadingFolder}
              >
                <Folder className="w-4 h-4 mr-2" />
                {isLoadingFolder ? '加载中...' : '选择文件夹'}
              </Button>
            </div>
          }
        />

        {/* Search and Controls - Only show in files view */}
        {folderView.currentView === 'files' && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder="搜索图片..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              {selectedCount > 0 && (
                <div className="flex items-center space-x-2">
                  <Badge variant="primary">
                    已选择 {selectedCount} 张
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
                {selectedCount === images.length ? '取消全选' : '全选'}
              </Button>
            </div>
          </div>
        )}

        {/* Folder Loading Progress */}
        {isLoadingFolder && folderProgress.total > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                正在加载文件夹中的图片...
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

        {/* Main Content */}
        {folderView.currentView === 'folders' ? (
          <FolderView
            folders={folders}
            loading={isLoading}
            onFolderClick={handleFolderClick}
          />
        ) : (
          <>
            {/* Images Grid/List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loading size="lg" text="加载图片中..." />
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? '未找到匹配的图片' : '还没有图片'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? '尝试调整搜索条件' : currentFolderPath ? '该文件夹中暂无图片' : '开始添加您的第一张图片'}
                </p>
                {!searchQuery && (
                  <Button onClick={handleFolderSelect}>
                    <Folder className="w-4 h-4 mr-2" />
                    选择文件夹
                  </Button>
                )}
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                  : 'space-y-3'
              )}>
                {images.map((image) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    isSelected={selectedFiles.includes(image.id)}
                    onSelect={toggleFileSelection}
                    onPreview={(image) => {
                      const index = images.findIndex(img => img.id === image.id);
                      setPreviewIndex(index);
                      setPreviewImage(image);
                    }}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Filter Panel */}
        <FilterPanel
          isOpen={showFilterPanel}
          onClose={() => setShowFilterPanel(false)}
        />

        {/* Image Preview */}
        <ImagePreview
          image={previewImage}
          images={images}
          currentIndex={previewIndex}
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          onNavigate={(index) => {
            setPreviewIndex(index);
            setPreviewImage(images[index]);
          }}
        />
      </PageContainer>
    </Layout>
  );
};

export default Images;