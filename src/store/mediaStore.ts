import { create } from 'zustand';
import { MediaFile, FilterOptions, SortOptions, AppState, FolderInfo, FolderViewState } from '../types';
import { mediaStorage } from '../lib/storage';
import { processFile } from '../lib/fileSystem';

interface MediaStore {
  // 状态
  files: MediaFile[];
  selectedFiles: string[];
  selectedFile: MediaFile | null;
  loading: boolean;
  isLoading: boolean;
  error: string | null;
  filter: FilterOptions;
  sort: SortOptions;
  viewMode: 'grid' | 'list';
  searchQuery: string;
  filteredFiles: MediaFile[];
  
  // 文件夹相关状态
  folderView: FolderViewState;
  folders: FolderInfo[];
  currentFolderPath: string | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 文件管理
  loadFiles: () => Promise<void>;
  addFiles: (files: File[]) => Promise<void>;
  addFilesWithProgress: (files: File[], onProgress?: (current: number, total: number, path: string) => void) => Promise<void>;
  removeFile: (id: string) => Promise<void>;
  removeSelectedFiles: () => Promise<void>;
  clearAllFiles: () => Promise<void>;
  
  // 筛选和排序
  setFilter: (filter: FilterOptions) => void;
  setSort: (sort: SortOptions) => void;
  setSearchQuery: (query: string) => void;
  
  // 选择管理
  setSelectedFile: (file: MediaFile | null) => void;
  toggleFileSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  selectAllFiles: () => void;
  
  // 视图模式
  setViewMode: (mode: 'grid' | 'list') => void;
  
  // 获取筛选后的文件
  getFilteredFiles: () => MediaFile[];
  getImageFiles: () => MediaFile[];
  getVideoFiles: () => MediaFile[];
  
  // 文件夹相关方法
  loadFolders: () => Promise<void>;
  loadImageFolders: () => Promise<void>;
  loadVideoFolders: () => Promise<void>;
  setCurrentFolder: (folderPath: string | null) => void;
  getCurrentFolderFiles: () => MediaFile[];
  addFilesWithFolder: (files: File[], folderPath: string, folderName: string, onProgress?: (current: number, total: number, path: string) => void) => Promise<void>;
}

// 筛选文件函数
const filterFiles = (files: MediaFile[], filter: FilterOptions): MediaFile[] => {
  let filtered = [...files];
  
  // 按类型筛选
  if (filter.fileTypes && filter.fileTypes.length > 0) {
    filtered = filtered.filter(file => filter.fileTypes.includes(file.type));
  }
  
  // 按大小范围筛选
  if (filter.sizeRange) {
    const [min, max] = filter.sizeRange;
    filtered = filtered.filter(file => file.size >= min && file.size <= max);
  }
  
  // 按日期范围筛选
  if (filter.dateRange) {
    const [start, end] = filter.dateRange;
    filtered = filtered.filter(file => {
      const fileDate = new Date(file.lastModified);
      return fileDate.getTime() >= start && fileDate.getTime() <= end;
    });
  }
  
  // 按搜索关键词筛选
  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    filtered = filtered.filter(file => 
      file.name.toLowerCase().includes(query)
    );
  }
  
  return filtered;
};

// 排序文件函数
const sortFiles = (files: MediaFile[], sort: SortOptions): MediaFile[] => {
  const sorted = [...files];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sort.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'date':
        comparison = a.lastModified - b.lastModified;
        break;
      default:
        comparison = 0;
    }
    
    return sort.sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
};

export const useMediaStore = create<MediaStore>((set, get) => ({
  // 初始状态
  files: [],
  selectedFiles: [],
  selectedFile: null,
  loading: false,
  isLoading: false,
  error: null,
  searchQuery: '',
  filteredFiles: [],
  filter: {
    fileTypes: [],
    searchQuery: ''
  },
  sort: {
    sortBy: 'date',
    sortOrder: 'desc'
  },
  viewMode: 'grid',
  
  // 文件夹相关初始状态
  folderView: {
    currentView: 'folders',
    folders: []
  },
  folders: [],
  currentFolderPath: null,
  
  // Actions
  setLoading: (loading) => set({ loading, isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setSearchQuery: (searchQuery) => {
    set({ searchQuery });
    const { getFilteredFiles } = get();
    set({ filteredFiles: getFilteredFiles() });
  },
  
  // 加载所有文件
  loadFiles: async () => {
    set({ loading: true, error: null });
    
    try {
      const files = await mediaStorage.getAllFiles();
      set({ files, loading: false });
      
      // 更新筛选后的文件列表
      const { getFilteredFiles } = get();
      set({ filteredFiles: getFilteredFiles() });
    } catch (error) {
      console.error('加载文件失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '加载文件失败',
        loading: false 
      });
    }
  },
  
  // 添加文件
  addFiles: async (newFiles) => {
    set({ loading: true, error: null });
    
    try {
      // 处理文件
      const processedFiles: MediaFile[] = [];
      
      for (const file of newFiles) {
        try {
          const mediaFile = await processFile(file);
          processedFiles.push(mediaFile);
        } catch (error) {
          console.warn(`处理文件 ${file.name} 失败:`, error);
        }
      }
      
      if (processedFiles.length === 0) {
        set({ error: '没有有效的文件被添加', loading: false });
        return;
      }
      
      // 保存到IndexedDB
      await mediaStorage.saveFiles(processedFiles);
      
      // 更新状态
      const { files } = get();
      const updatedFiles = [...files, ...processedFiles];
      
      set({ 
        files: updatedFiles,
        loading: false,
        error: processedFiles.length < newFiles.length ? 
          `成功添加 ${processedFiles.length} 个文件，${newFiles.length - processedFiles.length} 个文件处理失败` : 
          null
      });
      
      // 更新筛选后的文件列表
      const { getFilteredFiles } = get();
      set({ filteredFiles: getFilteredFiles() });
    } catch (error) {
      console.error('添加文件失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '添加文件失败',
        loading: false 
      });
    }
  },

  // 添加文件（带进度回调）
  addFilesWithProgress: async (newFiles, onProgress) => {
    set({ loading: true, error: null });
    
    try {
      // 处理文件
      const processedFiles: MediaFile[] = [];
      const total = newFiles.length;
      
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        
        try {
          // 调用进度回调
          onProgress?.(i + 1, total, file.name);
          
          const mediaFile = await processFile(file);
          processedFiles.push(mediaFile);
        } catch (error) {
          console.warn(`处理文件 ${file.name} 失败:`, error);
        }
      }
      
      if (processedFiles.length === 0) {
        set({ error: '没有有效的文件被添加', loading: false });
        return;
      }
      
      // 保存到IndexedDB
      await mediaStorage.saveFiles(processedFiles);
      
      // 更新状态
      const { files } = get();
      const updatedFiles = [...files, ...processedFiles];
      
      set({ 
        files: updatedFiles,
        loading: false,
        error: processedFiles.length < newFiles.length ? 
          `成功添加 ${processedFiles.length} 个文件，${newFiles.length - processedFiles.length} 个文件处理失败` : 
          null
      });
      
      // 更新筛选后的文件列表
      const { getFilteredFiles } = get();
      set({ filteredFiles: getFilteredFiles() });
    } catch (error) {
      console.error('添加文件失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '添加文件失败',
        loading: false 
      });
    }
  },
  
  // 删除文件
  removeFile: async (id) => {
    set({ loading: true, error: null });
    
    try {
      await mediaStorage.deleteFile(id);
      
      const { files, selectedFiles } = get();
      const updatedFiles = files.filter(file => file.id !== id);
      const updatedSelectedFiles = selectedFiles.filter(fileId => fileId !== id);
      
      set({ 
        files: updatedFiles,
        selectedFiles: updatedSelectedFiles,
        selectedFile: get().selectedFile?.id === id ? null : get().selectedFile,
        loading: false 
      });
      
      // 更新筛选后的文件列表
      const { getFilteredFiles } = get();
      set({ filteredFiles: getFilteredFiles() });
    } catch (error) {
      console.error('删除文件失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '删除文件失败',
        loading: false 
      });
    }
  },

  // 批量删除选中的文件
  removeSelectedFiles: async () => {
    console.log('🚀 [MediaStore] removeSelectedFiles 开始执行');
    
    const { selectedFiles, files } = get();
    console.log('🚀 [MediaStore] 当前选中文件:', selectedFiles);
    console.log('🚀 [MediaStore] 当前文件总数:', files.length);
    
    if (selectedFiles.length === 0) {
      console.log('🚀 [MediaStore] 没有选中文件，退出删除');
      return;
    }
    
    console.log('🚀 [MediaStore] 准备从存储中删除文件:', selectedFiles);
    
    try {
      // 从存储中删除文件
      console.log('🚀 [MediaStore] 调用 mediaStorage.deleteFiles');
      await mediaStorage.deleteFiles(selectedFiles);
      console.log('🚀 [MediaStore] 存储删除操作完成');
      
      // 更新状态
      const updatedFiles = files.filter(file => !selectedFiles.includes(file.id));
      console.log('🚀 [MediaStore] 删除前文件数量:', files.length);
      console.log('🚀 [MediaStore] 删除后文件数量:', updatedFiles.length);
      
      set({
        files: updatedFiles,
        selectedFiles: [],
        selectedFile: null
      });
      
      console.log('🚀 [MediaStore] 状态更新完成，调用 getFilteredFiles');
      // 更新筛选后的文件列表
      const { getFilteredFiles } = get();
      const newFilteredFiles = getFilteredFiles();
      set({ filteredFiles: newFilteredFiles });
      console.log('🚀 [MediaStore] filteredFiles 已更新，数量:', newFilteredFiles.length);
      console.log('🚀 [MediaStore] removeSelectedFiles 执行完成');
    } catch (error) {
      console.error('🚀 [MediaStore] 删除文件时发生错误:', error);
      throw error;
    }
  },
  
  // 清空所有文件
  clearAllFiles: async () => {
    set({ loading: true, error: null });
    
    try {
      await mediaStorage.clearAll();
      set({ 
        files: [],
        selectedFiles: [],
        selectedFile: null,
        loading: false 
      });
    } catch (error) {
      console.error('清空文件失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '清空文件失败',
        loading: false 
      });
    }
  },
  
  // 设置筛选条件
  setFilter: (filter) => {
    set({ filter });
    const { getFilteredFiles } = get();
    set({ filteredFiles: getFilteredFiles() });
  },
  
  // 设置排序条件
  setSort: (sort) => {
    set({ sort });
    const { getFilteredFiles } = get();
    set({ filteredFiles: getFilteredFiles() });
  },
  
  // 设置选中的文件
  setSelectedFile: (file) => set({ selectedFile: file }),
  
  // 切换文件选择状态
  toggleFileSelection: (id) => {
    const { selectedFiles } = get();
    const isSelected = selectedFiles.includes(id);
    
    if (isSelected) {
      set({ selectedFiles: selectedFiles.filter(fileId => fileId !== id) });
    } else {
      set({ selectedFiles: [...selectedFiles, id] });
    }
  },
  
  // 清除选择
  clearSelection: () => set({ selectedFiles: [] }),
  
  // 全选
  selectAll: () => {
    const { files } = get();
    const allIds = files.map(file => file.id);
    set({ selectedFiles: allIds });
  },
  
  selectAllFiles: () => {
    const { files, currentFolderPath } = get();
    
    // 如果当前在文件夹视图中，只选择当前文件夹的文件
    let targetFiles = files;
    if (currentFolderPath) {
      targetFiles = files.filter(file => file.folderPath === currentFolderPath);
    }
    
    const allIds = targetFiles.map(file => file.id);
    set({ selectedFiles: allIds });
  },
  
  // 设置视图模式
  setViewMode: (mode) => set({ viewMode: mode }),
  
  // 获取筛选后的文件
  getFilteredFiles: () => {
    const { files, filter, sort, currentFolderPath } = get();
    
    // 如果当前在文件夹视图中，只显示当前文件夹的文件
    let targetFiles = files;
    if (currentFolderPath) {
      targetFiles = files.filter(file => file.folderPath === currentFolderPath);
    }
    
    const filtered = filterFiles(targetFiles, filter);
    return sortFiles(filtered, sort);
  },
  
  // 获取图片文件
  getImageFiles: () => {
    const { files, filter, sort, currentFolderPath } = get();
    
    // 如果当前在文件夹视图中，只显示当前文件夹的文件
    let targetFiles = files;
    if (currentFolderPath) {
      targetFiles = files.filter(file => file.folderPath === currentFolderPath);
    }
    
    // 筛选出图片文件
    const imageFiles = targetFiles.filter(file => file.type === 'image');
    const filtered = filterFiles(imageFiles, filter);
    return sortFiles(filtered, sort);
  },

  // 获取视频文件
  getVideoFiles: () => {
    const { files, filter, sort, currentFolderPath } = get();
    
    // 如果当前在文件夹视图中，只显示当前文件夹的文件
    let targetFiles = files;
    if (currentFolderPath) {
      targetFiles = files.filter(file => file.folderPath === currentFolderPath);
    }
    
    // 筛选出视频文件
    const videoFiles = targetFiles.filter(file => file.type === 'video');
    const filtered = filterFiles(videoFiles, filter);
    return sortFiles(filtered, sort);
  },
  
  // 文件夹相关方法实现
  
  // 加载所有文件夹
  loadFolders: async () => {
    set({ loading: true, error: null });
    
    try {
      const folders = await mediaStorage.getAllFolders();
      const { folderView } = get();
      set({ 
        folders,
        folderView: {
          ...folderView,
          folders
        },
        loading: false 
      });
    } catch (error) {
      console.error('加载文件夹失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '加载文件夹失败',
        loading: false 
      });
    }
  },

  // 加载图片文件夹
  loadImageFolders: async () => {
    set({ loading: true, error: null });
    
    try {
      const folders = await mediaStorage.getFoldersByType('image');
      const { folderView } = get();
      set({ 
        folders,
        folderView: {
          ...folderView,
          folders
        },
        loading: false 
      });
    } catch (error) {
      console.error('加载图片文件夹失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '加载图片文件夹失败',
        loading: false 
      });
    }
  },

  // 加载视频文件夹
  loadVideoFolders: async () => {
    console.log('📁 [MediaStore] loadVideoFolders 开始执行');
    set({ isLoading: true, error: null });
    try {
      console.log('📁 [MediaStore] 调用 mediaStorage.getFoldersByType("video")');
      const folders = await mediaStorage.getFoldersByType('video');
      console.log('📁 [MediaStore] getFoldersByType 返回结果:', {
        foldersCount: folders.length,
        folders: folders.map(f => ({
          name: f.name,
          path: f.path,
          fileCount: f.fileCount,
          hasThumbnail: !!f.thumbnail
        }))
      });
      
      const newState = {
        folders,
        folderView: {
          ...get().folderView,
          currentView: 'folders' as const
        },
        isLoading: false
      };
      
      console.log('📁 [MediaStore] 设置新状态:', {
        foldersCount: newState.folders.length,
        currentView: newState.folderView.currentView,
        isLoading: newState.isLoading
      });
      
      set(newState);
      
      console.log('📁 [MediaStore] loadVideoFolders 执行完成');
    } catch (error) {
      console.error('📁 [MediaStore] loadVideoFolders 执行失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '加载视频文件夹失败',
        isLoading: false 
      });
    }
  },
  
  // 设置当前文件夹
  setCurrentFolder: (folderPath) => {
    set({ 
      currentFolderPath: folderPath,
      folderView: {
        ...get().folderView,
        currentView: folderPath ? 'files' : 'folders'
      }
    });
    
    // 更新筛选后的文件列表
    const { getFilteredFiles } = get();
    set({ filteredFiles: getFilteredFiles() });
  },
  

  
  // 获取当前文件夹的文件
  getCurrentFolderFiles: () => {
    const { files, currentFolderPath, filter, sort } = get();
    
    let folderFiles = files;
    if (currentFolderPath) {
      folderFiles = files.filter(file => file.folderPath === currentFolderPath);
    }
    
    const filtered = filterFiles(folderFiles, filter);
    return sortFiles(filtered, sort);
  },
  
  // 添加带文件夹信息的文件
  addFilesWithFolder: async (newFiles, folderPath, folderName, onProgress) => {
    set({ loading: true, error: null });
    
    try {
      // 处理文件
      const processedFiles: MediaFile[] = [];
      const total = newFiles.length;
      
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        
        try {
          // 调用进度回调
          onProgress?.(i + 1, total, file.name);
          
          const mediaFile = await processFile(file);
          // 添加文件夹信息
          mediaFile.folderPath = folderPath;
          mediaFile.folderName = folderName;
          
          processedFiles.push(mediaFile);
        } catch (error) {
          console.warn(`处理文件 ${file.name} 失败:`, error);
        }
      }
      
      if (processedFiles.length === 0) {
        set({ error: '没有有效的文件被添加', loading: false });
        return;
      }
      
      // 保存到IndexedDB
      await mediaStorage.saveFiles(processedFiles);
      
      // 更新状态
      const { files } = get();
      const updatedFiles = [...files, ...processedFiles];
      
      set({ 
        files: updatedFiles,
        loading: false,
        error: processedFiles.length < newFiles.length ? 
          `成功添加 ${processedFiles.length} 个文件，${newFiles.length - processedFiles.length} 个文件处理失败` : 
          null
      });
      
      // 重新加载文件夹列表
      await get().loadFolders();
      
      // 更新筛选后的文件列表
      const { getFilteredFiles } = get();
      set({ filteredFiles: getFilteredFiles() });
    } catch (error) {
      console.error('添加文件失败:', error);
      set({ 
        error: error instanceof Error ? error.message : '添加文件失败',
        loading: false 
      });
    }
  }
}));

// 导出选择器函数
export const selectFiles = (state: MediaStore) => state.files;
export const selectSelectedFiles = (state: MediaStore) => state.selectedFiles;
export const selectSelectedFile = (state: MediaStore) => state.selectedFile;
export const selectLoading = (state: MediaStore) => state.loading;
export const selectError = (state: MediaStore) => state.error;
export const selectFilter = (state: MediaStore) => state.filter;
export const selectSort = (state: MediaStore) => state.sort;
export const selectViewMode = (state: MediaStore) => state.viewMode;