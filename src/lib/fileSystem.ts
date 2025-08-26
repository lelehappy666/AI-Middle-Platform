import { MediaFile, FilePickerOptions, IMAGE_PICKER_OPTIONS, VIDEO_PICKER_OPTIONS, SUPPORTED_VIDEO_TYPES } from '../types';

// 检查浏览器是否支持 File System Access API
export const isFileSystemAccessSupported = (): boolean => {
  return 'showOpenFilePicker' in window;
};

// 检查浏览器是否支持文件夹选择
export const isDirectoryPickerSupported = (): boolean => {
  return 'showDirectoryPicker' in window;
};

// 生成唯一ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化时间
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// 检查文件类型
export const getFileType = (file: File): 'image' | 'video' | 'unknown' => {
  // 首先检查MIME类型
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  
  // 如果MIME类型不明确，基于文件扩展名检测
  const fileName = file.name.toLowerCase();
  const extension = fileName.substring(fileName.lastIndexOf('.'));
  
  // 检查是否为支持的图片格式
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.tif'];
  if (imageExtensions.includes(extension)) {
    return 'image';
  }
  
  // 检查是否为支持的视频格式
  if (SUPPORTED_VIDEO_TYPES.includes(extension)) {
    return 'video';
  }
  
  // 额外的MIME类型检测（针对一些特殊格式）
  const videoMimeTypes = [
    'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo',
    'video/webm', 'video/ogg', 'video/3gpp', 'video/x-flv',
    'video/x-ms-wmv', 'video/x-matroska', 'application/x-mpegURL',
    'video/mp2t', 'video/x-m4v', 'video/x-ms-asf'
  ];
  
  if (videoMimeTypes.includes(file.type)) {
    return 'video';
  }
  
  return 'unknown';
};

// 生成图片缩略图
export const generateImageThumbnail = (file: File, maxSize: number = 300): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('无法创建canvas上下文'));
      return;
    }
    
    img.onload = () => {
      // 计算缩略图尺寸
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制缩略图
      ctx.drawImage(img, 0, 0, width, height);
      
      // 转换为base64
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnail);
    };
    
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
};

// 生成视频缩略图
export const generateVideoThumbnail = (file: File): Promise<{ thumbnail: string; duration: number; dimensions: { width: number; height: number } }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('无法创建canvas上下文'));
      return;
    }
    
    video.onloadedmetadata = () => {
      // 设置视频时间到中间位置
      video.currentTime = video.duration / 2;
    };
    
    video.onseeked = () => {
      const { videoWidth, videoHeight, duration } = video;
      
      // 计算缩略图尺寸（保持16:9比例）
      const maxSize = 300;
      let width = videoWidth;
      let height = videoHeight;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制视频帧
      ctx.drawImage(video, 0, 0, width, height);
      
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      
      resolve({
        thumbnail,
        duration,
        dimensions: { width: videoWidth, height: videoHeight }
      });
    };
    
    video.onerror = () => reject(new Error('视频加载失败'));
    video.src = URL.createObjectURL(file);
    video.load();
  });
};

// 获取图片尺寸
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    
    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
};

// 处理文件并创建MediaFile对象
export const processFile = async (file: File): Promise<MediaFile> => {
  const fileType = getFileType(file);
  
  if (fileType === 'unknown') {
    throw new Error(`不支持的文件类型: ${file.type}`);
  }
  
  const mediaFile: MediaFile = {
    id: generateId(),
    name: file.name,
    type: fileType,
    size: file.size,
    lastModified: file.lastModified,
    file
  };
  
  try {
    if (fileType === 'image') {
      const [thumbnail, dimensions] = await Promise.all([
        generateImageThumbnail(file),
        getImageDimensions(file)
      ]);
      mediaFile.thumbnail = thumbnail;
      mediaFile.dimensions = dimensions;
    } else if (fileType === 'video') {
      const videoData = await generateVideoThumbnail(file);
      mediaFile.thumbnail = videoData.thumbnail;
      mediaFile.duration = videoData.duration;
      mediaFile.dimensions = videoData.dimensions;
    }
  } catch (error) {
    console.warn(`处理文件 ${file.name} 时出错:`, error);
  }
  
  return mediaFile;
};

// 使用File System Access API选择文件
export const selectFiles = async (options: FilePickerOptions): Promise<File[]> => {
  if (!isFileSystemAccessSupported()) {
    throw new Error('浏览器不支持File System Access API');
  }
  
  try {
    const fileHandles = await (window as any).showOpenFilePicker(options);
    const files: File[] = [];
    
    for (const fileHandle of fileHandles) {
      const file = await fileHandle.getFile();
      files.push(file);
    }
    
    return files;
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      return []; // 用户取消选择
    }
    throw error;
  }
};

// 选择图片文件
export const selectImageFiles = (): Promise<File[]> => {
  return selectFiles(IMAGE_PICKER_OPTIONS);
};

// 选择视频文件
export const selectVideoFiles = (): Promise<File[]> => {
  return selectFiles(VIDEO_PICKER_OPTIONS);
};

// 处理拖拽文件
export const handleDroppedFiles = (files: FileList): File[] => {
  const validFiles: File[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileType = getFileType(file);
    
    if (fileType !== 'unknown') {
      validFiles.push(file);
    }
  }
  
  return validFiles;
};

// 递归遍历文件夹获取所有图片文件
export const getAllImagesFromDirectory = async (
  directoryHandle: FileSystemDirectoryHandle,
  onProgress?: (current: number, total: number, currentPath: string) => void
): Promise<File[]> => {
  const imageFiles: File[] = [];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  let processedCount = 0;
  let totalCount = 0;

  // 首先计算总文件数
  const countFiles = async (dirHandle: FileSystemDirectoryHandle, path = ''): Promise<number> => {
    let count = 0;
    try {
      for await (const [name, handle] of (dirHandle as any).entries()) {
        if (handle.kind === 'file') {
          const extension = name.toLowerCase().substring(name.lastIndexOf('.'));
          if (imageExtensions.includes(extension)) {
            count++;
          }
        } else if (handle.kind === 'directory') {
          count += await countFiles(handle, `${path}/${name}`);
        }
      }
    } catch (error) {
      console.warn(`无法访问目录 ${path}:`, error);
    }
    return count;
  };

  // 递归收集图片文件
  const collectImages = async (dirHandle: FileSystemDirectoryHandle, path = ''): Promise<void> => {
    try {
      for await (const [name, handle] of (dirHandle as any).entries()) {
        if (handle.kind === 'file') {
          const extension = name.toLowerCase().substring(name.lastIndexOf('.'));
          if (imageExtensions.includes(extension)) {
            try {
              const file = await handle.getFile();
              imageFiles.push(file);
              processedCount++;
              onProgress?.(processedCount, totalCount, `${path}/${name}`);
            } catch (error) {
              console.warn(`无法读取文件 ${path}/${name}:`, error);
            }
          }
        } else if (handle.kind === 'directory') {
          await collectImages(handle, `${path}/${name}`);
        }
      }
    } catch (error) {
      console.warn(`无法访问目录 ${path}:`, error);
    }
  };

  // 计算总数并收集文件
  totalCount = await countFiles(directoryHandle);
  await collectImages(directoryHandle);

  return imageFiles;
};

// 递归遍历文件夹获取所有视频文件
export const getAllVideosFromDirectory = async (
  directoryHandle: FileSystemDirectoryHandle,
  onProgress?: (current: number, total: number, currentPath: string) => void
): Promise<File[]> => {
  const videoFiles: File[] = [];
  const videoExtensions = SUPPORTED_VIDEO_TYPES;
  let processedCount = 0;
  let totalCount = 0;

  // 首先计算总文件数
  const countFiles = async (dirHandle: FileSystemDirectoryHandle, path = ''): Promise<number> => {
    let count = 0;
    try {
      for await (const [name, handle] of (dirHandle as any).entries()) {
        if (handle.kind === 'file') {
          const extension = name.toLowerCase().substring(name.lastIndexOf('.'));
          if (videoExtensions.includes(extension)) {
            count++;
          }
        } else if (handle.kind === 'directory') {
          count += await countFiles(handle, `${path}/${name}`);
        }
      }
    } catch (error) {
      console.warn(`无法访问目录 ${path}:`, error);
    }
    return count;
  };

  // 递归收集视频文件
  const collectVideos = async (dirHandle: FileSystemDirectoryHandle, path = ''): Promise<void> => {
    try {
      for await (const [name, handle] of (dirHandle as any).entries()) {
        if (handle.kind === 'file') {
          const extension = name.toLowerCase().substring(name.lastIndexOf('.'));
          if (videoExtensions.includes(extension)) {
            try {
              const file = await handle.getFile();
              videoFiles.push(file);
              processedCount++;
              onProgress?.(processedCount, totalCount, `${path}/${name}`);
            } catch (error) {
              console.warn(`无法读取文件 ${path}/${name}:`, error);
            }
          }
        } else if (handle.kind === 'directory') {
          await collectVideos(handle, `${path}/${name}`);
        }
      }
    } catch (error) {
      console.warn(`无法访问目录 ${path}:`, error);
    }
  };

  // 计算总数并收集文件
  totalCount = await countFiles(directoryHandle);
  await collectVideos(directoryHandle);

  return videoFiles;
};

// 传统方式选择文件夹（使用input[webkitdirectory]）
const selectDirectoryLegacy = (): Promise<FileList> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.multiple = true;
    
    input.onchange = (event) => {
      const files = (event.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        resolve(files);
      } else {
        reject(new Error('未选择任何文件'));
      }
    };
    
    input.oncancel = () => {
      reject(new Error('用户取消了文件夹选择'));
    };
    
    // 触发文件选择对话框
    input.click();
  });
};

// 从FileList中筛选图片文件
const filterImageFiles = (fileList: FileList): File[] => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const imageFiles: File[] = [];
  
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (imageExtensions.includes(extension)) {
      imageFiles.push(file);
    }
  }
  
  return imageFiles;
};

// 处理传统方式选择的文件夹
const processLegacyDirectorySelection = async (
  fileList: FileList,
  onProgress?: (current: number, total: number, currentPath: string) => void
): Promise<{ files: File[]; directoryName: string }> => {
  const imageFiles = filterImageFiles(fileList);
  const totalFiles = imageFiles.length;
  
  // 获取文件夹名称（从第一个文件的路径中提取）
  let directoryName = '选择的文件夹';
  if (imageFiles.length > 0) {
    const firstFile = imageFiles[0] as any;
    if (firstFile.webkitRelativePath) {
      const pathParts = firstFile.webkitRelativePath.split('/');
      directoryName = pathParts[0] || '选择的文件夹';
    }
  }
  
  // 模拟进度回调
  if (onProgress) {
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i] as any;
      const relativePath = file.webkitRelativePath || file.name;
      onProgress(i + 1, totalFiles, relativePath);
      // 添加小延迟以显示进度
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
  }
  
  return {
    files: imageFiles,
    directoryName
  };
};

// 选择文件夹并获取所有图片
export const selectDirectoryAndGetImages = async (
  onProgress?: (current: number, total: number, currentPath: string) => void
): Promise<{ files: File[]; directoryName: string }> => {
  // 优先使用File System Access API
  if (isDirectoryPickerSupported()) {
    try {
      const directoryHandle = await (window as any).showDirectoryPicker();
      const files = await getAllImagesFromDirectory(directoryHandle, onProgress);
      
      return {
        files,
        directoryName: directoryHandle.name
      };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('用户取消了文件夹选择');
      }
      throw error;
    }
  }
  
  // 降级到传统方式
  try {
    const fileList = await selectDirectoryLegacy();
    return await processLegacyDirectorySelection(fileList, onProgress);
  } catch (error) {
    throw error;
  }
};

// 从FileList中筛选视频文件
const filterVideoFiles = (fileList: FileList): File[] => {
  const videoExtensions = SUPPORTED_VIDEO_TYPES;
  const videoFiles: File[] = [];
  
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (videoExtensions.includes(extension)) {
      videoFiles.push(file);
    }
  }
  
  return videoFiles;
};

// 处理传统方式选择的视频文件夹
const processLegacyVideoDirectorySelection = async (
  fileList: FileList,
  onProgress?: (current: number, total: number, currentPath: string) => void
): Promise<{ files: File[]; directoryName: string }> => {
  const videoFiles = filterVideoFiles(fileList);
  const totalFiles = videoFiles.length;
  
  // 获取文件夹名称（从第一个文件的路径中提取）
  let directoryName = '选择的文件夹';
  if (videoFiles.length > 0) {
    const firstFile = videoFiles[0] as any;
    if (firstFile.webkitRelativePath) {
      const pathParts = firstFile.webkitRelativePath.split('/');
      directoryName = pathParts[0] || '选择的文件夹';
    }
  }
  
  // 模拟进度回调
  if (onProgress) {
    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i] as any;
      const relativePath = file.webkitRelativePath || file.name;
      onProgress(i + 1, totalFiles, relativePath);
      // 添加小延迟以显示进度
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }
  }
  
  return {
    files: videoFiles,
    directoryName
  };
};

// 选择文件夹并获取所有视频
export const selectDirectoryAndGetVideos = async (
  onProgress?: (current: number, total: number, currentPath: string) => void
): Promise<{ files: File[]; directoryName: string }> => {
  // 优先使用File System Access API
  if (isDirectoryPickerSupported()) {
    try {
      const directoryHandle = await (window as any).showDirectoryPicker();
      const files = await getAllVideosFromDirectory(directoryHandle, onProgress);
      
      return {
        files,
        directoryName: directoryHandle.name
      };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('用户取消了文件夹选择');
      }
      throw error;
    }
  }
  
  // 降级到传统方式
  try {
    const fileList = await selectDirectoryLegacy();
    return await processLegacyVideoDirectorySelection(fileList, onProgress);
  } catch (error) {
    throw error;
  }
};