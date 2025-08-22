// 文件选择器选项接口
export interface FilePickerOptions {
  types: {
    description: string;
    accept: Record<string, string[]>;
  }[];
  multiple: boolean;
}

// 媒体文件接口
export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  size: number;
  lastModified: number;
  file: File;
  thumbnail?: string;
  duration?: number; // 仅视频文件
  dimensions?: { width: number; height: number };
  folderPath?: string; // 文件夹路径
  folderName?: string; // 文件夹名称
}

// 媒体库接口
export interface MediaLibrary {
  images: MediaFile[];
  videos: MediaFile[];
  totalSize: number;
  lastUpdated: number;
}

// IndexedDB 存储结构
export interface StoredMediaFile {
  id: string;
  name: string;
  type: 'image' | 'video';
  size: number;
  lastModified: number;
  originalFile: Blob; // 原始文件数据
  thumbnail: Blob; // 缩略图数据
  metadata: {
    dimensions?: { width: number; height: number };
    duration?: number;
    format: string;
  };
  tags: string[];
  addedAt: number;
  folderPath?: string; // 文件夹路径
  folderName?: string; // 文件夹名称
}

// 用户偏好设置
export interface UserPreferences {
  sortBy: 'name' | 'size' | 'date';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  gridSize: 'small' | 'medium' | 'large';
  filters: {
    fileTypes: string[];
    sizeRange: [number, number];
    dateRange: [number, number];
  };
}

// 筛选选项
export interface FilterOptions {
  fileTypes: string[];
  sizeRange?: [number, number];
  dateRange?: [number, number];
  searchQuery?: string;
  size?: 'small' | 'medium' | 'large';
}

// 排序选项
export interface SortOptions {
  sortBy: 'name' | 'size' | 'date';
  sortOrder: 'asc' | 'desc';
}

// 网格视图选项
export interface GridViewOptions {
  gridSize: 'small' | 'medium' | 'large';
  showDetails: boolean;
}

// 文件上传状态
export interface UploadStatus {
  isUploading: boolean;
  progress: number;
  error?: string;
}

// 预览模态框状态
export interface PreviewModalState {
  isOpen: boolean;
  currentFile?: MediaFile;
  currentIndex: number;
  files: MediaFile[];
}

// 文件夹信息接口
export interface FolderInfo {
  name: string;
  path: string;
  fileCount: number;
  thumbnail?: string; // 第一张图片作为缩略图
  lastModified: number;
}

// 文件夹视图状态
export interface FolderViewState {
  currentView: 'folders' | 'files';
  currentFolder?: string;
  folders: FolderInfo[];
}

// 应用状态接口
export interface AppState {
  mediaLibrary: MediaLibrary;
  userPreferences: UserPreferences;
  uploadStatus: UploadStatus;
  previewModal: PreviewModalState;
  folderView: FolderViewState;
  isLoading: boolean;
  error?: string;
}

// 常量定义
export const SUPPORTED_IMAGE_TYPES = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];
export const SUPPORTED_VIDEO_TYPES = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];

export const IMAGE_PICKER_OPTIONS: FilePickerOptions = {
  types: [{
    description: 'Images',
    accept: {
      'image/*': SUPPORTED_IMAGE_TYPES
    }
  }],
  multiple: true
};

export const VIDEO_PICKER_OPTIONS: FilePickerOptions = {
  types: [{
    description: 'Videos',
    accept: {
      'video/*': SUPPORTED_VIDEO_TYPES
    }
  }],
  multiple: true
};