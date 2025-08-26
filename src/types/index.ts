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
export const SUPPORTED_VIDEO_TYPES = [
  // 主流格式
  '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v',
  // 高清格式
  '.m2ts', '.mts', '.ts', '.vob',
  // 压缩格式
  '.3gp', '.3g2', '.f4v', '.divx', '.xvid',
  // 流媒体格式
  '.asf', '.rm', '.rmvb', '.ogv',
  // MPEG系列
  '.mpg', '.mpeg', '.m1v', '.m2v', '.mpe', '.mpv',
  // 其他格式
  '.dat', '.nsv', '.qt', '.dv', '.amv', '.mtv', '.swf', '.ogg',
  // 新兴格式
  '.av1', '.hevc', '.h265', '.vp9', '.vp8',
  // 专业格式
  '.prores', '.dnxhd', '.mxf', '.r3d', '.braw',
  // 移动设备格式
  '.m4p', '.3gpp', '.3gp2',
  // 流媒体格式扩展
  '.hls', '.dash', '.m3u8',
  // 原始和专业格式
  '.yuv', '.raw', '.y4m', '.ivf'
];

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

// AI 相关类型定义

// AI 模型提供商
export type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'google' | 'azure' | 'custom' | 'baidu' | 'alibaba' | 'tencent' | 'zhipu' | 'moonshot' | 'bytedance' | 'iflytek' | 'deepseek' | '硅基流动';

// AI 模型配置
export interface AIModel {
  id: string;
  name: string;
  model: string;
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  isEnabled: boolean;
  isConnected?: boolean;
  description?: string;
  createdAt: number;
}

// 对话消息类型
export type MessageRole = 'user' | 'assistant' | 'system';

// 对话消息
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  modelId?: string;
  isLoading?: boolean;
  error?: string;
}

// 对话会话
export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  modelId: string;
  createdAt: number;
  updatedAt: number;
}

// 录音文件分析结果
export interface AudioAnalysisResult {
  id: string;
  fileName: string;
  fileSize: number;
  duration: number;
  transcript?: string;
  summary?: string;
  keyPoints?: string[];
  keywords?: string[];
  topics?: Array<{ name: string; confidence: number }>;
  speakerCount?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  confidence?: number;
  language?: string;
  createdAt: number;
}

// 录音分析任务
export interface AudioAnalysisTask {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  fileUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: AudioAnalysisResult;
  error?: string;
  createdAt: number;
  updatedAt?: number;
}

// AI 生成任务类型
export type GenerationType = 'image' | 'video';

// AI 生成参数
export interface GenerationParams {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  aspectRatio?: string;
  steps?: number;
  guidance?: number;
  seed?: number;
  style?: string;
  model?: string;
}

// AI 生成结果
export interface GenerationResult {
  id: string;
  type: GenerationType;
  prompt: string;
  params: GenerationParams;
  url?: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

// AI 生成任务
export interface GenerationTask {
  id: string;
  type: GenerationType;
  params: GenerationParams;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: GenerationResult;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

// AI 设置
export interface AISettings {
  // 分类模型存储
  aiChatModels: AIModel[];
  audioAnalysisModels: AIModel[];
  imageGenerationModels: AIModel[];
  videoGenerationModels: AIModel[];
  pptGenerationModels: AIModel[];
  
  // 默认模型设置
  defaultChatModel?: string;
  defaultImageModel?: string;
  defaultVideoModel?: string;
  defaultGenerationModel?: string;
  autoSave: boolean;
  maxChatHistory: number;
}

// AI 状态
export interface AIState {
  // 对话相关
  chatSessions: ChatSession[];
  currentSessionId?: string;
  isGenerating: boolean;
  
  // 录音分析相关
  audioTasks: AudioAnalysisTask[];
  analysisResults: AudioAnalysisResult[];
  
  // AI 生成相关
  generationTasks: GenerationTask[];
  generationResults: GenerationResult[];
  
  // 设置
  settings: AISettings;
  
  // 通用状态
  isLoading: boolean;
  error?: string;
}