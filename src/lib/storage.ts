import { MediaFile, StoredMediaFile, MediaLibrary, FolderInfo } from '../types';

const DB_NAME = 'MediaLibraryDB';
const DB_VERSION = 1;
const STORE_NAME = 'mediaFiles';

// IndexedDB 数据库管理类
class MediaStorage {
  private db: IDBDatabase | null = null;

  // 初始化数据库
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('无法打开IndexedDB数据库'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 创建对象存储
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          
          // 创建索引
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('lastModified', 'lastModified', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  // 确保数据库已初始化
  private ensureDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('数据库未初始化，请先调用init()');
    }
    return this.db;
  }

  // 将MediaFile转换为StoredMediaFile
  private async mediaFileToStored(mediaFile: MediaFile): Promise<StoredMediaFile> {
    // 将原始文件转换为Blob
    const originalFileBlob = new Blob([await mediaFile.file.arrayBuffer()], { type: mediaFile.file.type });
    
    // 处理缩略图
    let thumbnailBlob: Blob;
    if (mediaFile.thumbnail) {
      try {
        thumbnailBlob = await fetch(mediaFile.thumbnail).then(r => r.blob());
      } catch (error) {
        console.warn('获取缩略图失败，使用空Blob:', error);
        thumbnailBlob = new Blob();
      }
    } else {
      thumbnailBlob = new Blob();
    }
    
    return {
      id: mediaFile.id,
      name: mediaFile.name,
      type: mediaFile.type,
      size: mediaFile.size,
      lastModified: mediaFile.lastModified,
      originalFile: originalFileBlob, // 保存原始文件数据
      thumbnail: thumbnailBlob,
      metadata: {
        duration: mediaFile.duration,
        dimensions: mediaFile.dimensions,
        format: mediaFile.type
      },
      tags: [],
      addedAt: Date.now(),
      folderPath: mediaFile.folderPath,
      folderName: mediaFile.folderName
    };
  }

  // 保存文件到IndexedDB
  async saveFile(mediaFile: MediaFile): Promise<void> {
    const db = this.ensureDB();
    
    return new Promise(async (resolve, reject) => {
      try {
        // 读取文件数据
        const arrayBuffer = await mediaFile.file.arrayBuffer();
        
        const storedFile: StoredMediaFile = {
            ...(await this.mediaFileToStored(mediaFile)),
            // fileData: arrayBuffer // 移除不存在的属性
          };

        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const request = store.put(storedFile);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('保存文件失败'));
      } catch (error) {
        reject(error);
      }
    });
  }

  // 批量保存文件
  async saveFiles(mediaFiles: MediaFile[]): Promise<void> {
    if (mediaFiles.length === 0) {
      return;
    }

    // 第一步：预处理所有文件数据（在事务外进行）
    const processedFiles: StoredMediaFile[] = [];
    
    try {
      for (const mediaFile of mediaFiles) {
        try {
          // 在事务外完成所有异步操作
          const storedFile = await this.mediaFileToStored(mediaFile);
          processedFiles.push(storedFile);
        } catch (error) {
          throw new Error(`处理文件 ${mediaFile.name} 失败: ${error}`);
        }
      }
    } catch (error) {
      throw error;
    }

    // 第二步：在单个事务中快速批量保存预处理的数据
    return this.saveBatchWithRetry(processedFiles);
  }

  // 带重试机制的批量保存
  private async saveBatchWithRetry(processedFiles: StoredMediaFile[], retryCount = 0): Promise<void> {
    const maxRetries = 3;
    const db = this.ensureDB();
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        let completed = 0;
        const total = processedFiles.length;
        let hasError = false;
        
        // 事务完成处理
        transaction.oncomplete = () => {
          if (!hasError) {
            resolve();
          }
        };
        
        // 事务错误处理
        transaction.onerror = () => {
          if (retryCount < maxRetries) {
            // 重试
            setTimeout(() => {
              this.saveBatchWithRetry(processedFiles, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, Math.pow(2, retryCount) * 100); // 指数退避
          } else {
            reject(new Error(`批量保存失败，已重试${maxRetries}次`));
          }
        };
        
        transaction.onabort = () => {
          if (!hasError && retryCount < maxRetries) {
            // 重试
            setTimeout(() => {
              this.saveBatchWithRetry(processedFiles, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, Math.pow(2, retryCount) * 100);
          } else {
            reject(new Error(`事务被中止，已重试${maxRetries}次`));
          }
        };
        
        // 批量添加所有预处理的文件
        for (const storedFile of processedFiles) {
          const request = store.put(storedFile);
          
          request.onsuccess = () => {
            completed++;
          };
          
          request.onerror = () => {
            hasError = true;
            if (retryCount < maxRetries) {
              transaction.abort();
            } else {
              reject(new Error(`保存文件 ${storedFile.name} 失败，已重试${maxRetries}次`));
            }
          };
        }
      } catch (error) {
        if (retryCount < maxRetries) {
          setTimeout(() => {
            this.saveBatchWithRetry(processedFiles, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, Math.pow(2, retryCount) * 100);
        } else {
          reject(error);
        }
      }
    });
  }

  // 获取所有文件
  async getAllFiles(): Promise<MediaFile[]> {
    const db = this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const storedFiles: StoredMediaFile[] = request.result;
        const mediaFiles: MediaFile[] = storedFiles.map(stored => {
          console.log('Debug: Converting stored file to MediaFile:', stored.name);
          console.log('Debug: stored.originalFile:', stored.originalFile);
          console.log('Debug: stored.originalFile.type:', stored.originalFile?.type);
          console.log('Debug: stored.originalFile.size:', stored.originalFile?.size);
          
          // 检查originalFile是否存在
          if (!stored.originalFile) {
            console.error('Debug: stored.originalFile is undefined for file:', stored.name);
            return null; // 跳过这个文件
          }
          
          const file = new File([stored.originalFile], stored.name, {
            type: stored.originalFile.type || (stored.type === 'image' ? 'image/jpeg' : 'video/mp4'),
            lastModified: stored.lastModified
          });
          
          console.log('Debug: Created File object:', file);
          console.log('Debug: File instanceof File:', file instanceof File);
          console.log('Debug: File.type:', file.type);
          console.log('Debug: File.size:', file.size);
          
          return {
            id: stored.id,
            name: stored.name,
            type: stored.type,
            size: stored.size,
            lastModified: stored.lastModified,
            thumbnail: stored.thumbnail.size > 0 ? URL.createObjectURL(stored.thumbnail) : undefined,
            duration: stored.metadata.duration,
            dimensions: stored.metadata.dimensions,
            folderPath: stored.folderPath,
            folderName: stored.folderName,
            file: file
          };
        }).filter(file => file !== null) as MediaFile[];
        
        resolve(mediaFiles);
      };
      
      request.onerror = () => {
        reject(new Error('获取文件列表失败'));
      };
    });
  }

  // 根据类型获取文件
  async getFilesByType(type: 'image' | 'video'): Promise<MediaFile[]> {
    const db = this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('type');
      const request = index.getAll(type);
      
      request.onsuccess = () => {
        const storedFiles: StoredMediaFile[] = request.result;
        const mediaFiles: MediaFile[] = storedFiles.map(stored => {
          if (!stored.originalFile) {
            console.error('Debug: stored.originalFile is undefined for file:', stored.name);
            return null;
          }
          
          return {
            id: stored.id,
            name: stored.name,
            type: stored.type,
            size: stored.size,
            lastModified: stored.lastModified,
            thumbnail: stored.thumbnail.size > 0 ? URL.createObjectURL(stored.thumbnail) : undefined,
            duration: stored.metadata.duration,
            dimensions: stored.metadata.dimensions,
            folderPath: stored.folderPath,
            folderName: stored.folderName,
            file: new File([stored.originalFile], stored.name, {
              type: stored.originalFile.type || (stored.type === 'image' ? 'image/jpeg' : 'video/mp4'),
              lastModified: stored.lastModified
            })
          };
        }).filter(file => file !== null) as MediaFile[];
        
        resolve(mediaFiles);
      };
      
      request.onerror = () => {
        reject(new Error(`获取${type}文件失败`));
      };
    });
  }

  // 根据ID获取文件
  async getFileById(id: string): Promise<MediaFile | null> {
    const db = this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => {
        const stored: StoredMediaFile = request.result;
        
        if (!stored) {
          resolve(null);
          return;
        }
        
        if (!stored.originalFile) {
          console.error('Debug: stored.originalFile is undefined for file:', stored.name);
          resolve(null);
          return;
        }
        
        const mediaFile: MediaFile = {
          id: stored.id,
          name: stored.name,
          type: stored.type,
          size: stored.size,
          lastModified: stored.lastModified,
          thumbnail: stored.thumbnail.size > 0 ? URL.createObjectURL(stored.thumbnail) : undefined,
          duration: stored.metadata.duration,
          dimensions: stored.metadata.dimensions,
          folderPath: stored.folderPath,
          folderName: stored.folderName,
          file: new File([stored.originalFile], stored.name, {
            type: stored.originalFile.type || (stored.type === 'image' ? 'image/jpeg' : 'video/mp4'),
            lastModified: stored.lastModified
          })
        };
        
        resolve(mediaFile);
      };
      
      request.onerror = () => {
        reject(new Error('获取文件失败'));
      };
    });
  }

  // 删除文件
  async deleteFile(id: string): Promise<void> {
    const db = this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('删除文件失败'));
    });
  }

  // 批量删除文件
  async deleteFiles(ids: string[]): Promise<void> {
    console.log('💾 [Storage] deleteFiles 开始执行');
    console.log('💾 [Storage] 要删除的文件ID:', ids);
    
    if (ids.length === 0) {
      console.log('💾 [Storage] 没有文件需要删除，直接返回');
      return;
    }

    const db = this.ensureDB();
    console.log('💾 [Storage] 数据库连接获取成功');
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      console.log('💾 [Storage] 创建删除事务');
      
      let completed = 0;
      let hasError = false;
      
      // 事务完成处理
      transaction.oncomplete = () => {
        console.log('💾 [Storage] 事务完成，已删除文件数量:', completed);
        if (!hasError) {
          console.log('💾 [Storage] 批量删除成功完成');
          resolve();
        }
      };
      
      // 事务错误处理
      transaction.onerror = () => {
        console.error('💾 [Storage] 事务发生错误');
        reject(new Error('批量删除文件失败'));
      };
      
      // 批量删除所有指定的文件
      for (const id of ids) {
        console.log('💾 [Storage] 删除文件:', id);
        const request = store.delete(id);
        
        request.onsuccess = () => {
          completed++;
          console.log('💾 [Storage] 文件删除成功:', id, '已完成:', completed, '/', ids.length);
        };
        
        request.onerror = () => {
          console.error('💾 [Storage] 文件删除失败:', id);
          hasError = true;
          reject(new Error(`删除文件 ${id} 失败`));
        };
      }
    });
  }

  // 清空所有文件
  async clearAll(): Promise<void> {
    const db = this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('清空数据失败'));
    });
  }

  // 获取存储统计信息
  async getStats(): Promise<{ totalFiles: number; totalSize: number; imageCount: number; videoCount: number }> {
    const files = await this.getAllFiles();
    
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      imageCount: files.filter(file => file.type === 'image').length,
      videoCount: files.filter(file => file.type === 'video').length
    };
    
    return stats;
  }

  // 获取所有文件夹信息
  async getAllFolders(): Promise<FolderInfo[]> {
    const files = await this.getAllFiles();
    const folderMap = new Map<string, FolderInfo>();
    
    files.forEach(file => {
      if (file.folderPath && file.folderName) {
        const existing = folderMap.get(file.folderPath);
        if (existing) {
          existing.fileCount++;
          existing.lastModified = Math.max(existing.lastModified, file.lastModified);
          // 如果还没有缩略图，使用当前文件的缩略图（支持图片和视频）
          if (!existing.thumbnail && file.thumbnail) {
            existing.thumbnail = file.thumbnail;
          }
        } else {
          folderMap.set(file.folderPath, {
            name: file.folderName,
            path: file.folderPath,
            fileCount: 1,
            thumbnail: file.thumbnail,
            lastModified: file.lastModified
          });
        }
      }
    });
    
    return Array.from(folderMap.values()).sort((a, b) => b.lastModified - a.lastModified);
  }

  // 根据类型获取文件夹信息
  async getFoldersByType(type: 'image' | 'video'): Promise<FolderInfo[]> {
    console.log(`💾 [Storage] getFoldersByType 开始执行，类型: ${type}`);
    const files = await this.getFilesByType(type);
    console.log(`💾 [Storage] 获取到 ${type} 文件数量:`, files.length);
    console.log(`💾 [Storage] ${type} 文件详情:`, files.map(f => ({
      name: f.name,
      folderPath: f.folderPath,
      folderName: f.folderName,
      type: f.type
    })));
    
    const folderMap = new Map<string, FolderInfo>();
    
    files.forEach(file => {
      if (file.folderPath && file.folderName) {
        console.log(`💾 [Storage] 处理文件夹: ${file.folderPath} (${file.folderName})`);
        const existing = folderMap.get(file.folderPath);
        if (existing) {
          existing.fileCount++;
          existing.lastModified = Math.max(existing.lastModified, file.lastModified);
          // 如果还没有缩略图，使用当前文件的缩略图（支持图片和视频）
          if (!existing.thumbnail && file.thumbnail) {
            existing.thumbnail = file.thumbnail;
          }
          console.log(`💾 [Storage] 更新现有文件夹，文件数量: ${existing.fileCount}`);
        } else {
          const newFolder = {
            name: file.folderName,
            path: file.folderPath,
            fileCount: 1,
            thumbnail: file.thumbnail,
            lastModified: file.lastModified
          };
          folderMap.set(file.folderPath, newFolder);
          console.log(`💾 [Storage] 创建新文件夹:`, newFolder);
        }
      } else {
        console.log(`💾 [Storage] 跳过文件（缺少文件夹信息）:`, {
          name: file.name,
          folderPath: file.folderPath,
          folderName: file.folderName
        });
      }
    });
    
    const result = Array.from(folderMap.values()).sort((a, b) => b.lastModified - a.lastModified);
    console.log(`💾 [Storage] getFoldersByType 返回结果，文件夹数量: ${result.length}`);
    console.log(`💾 [Storage] 返回的文件夹列表:`, result);
    
    return result;
  }

  // 根据文件夹路径获取文件
  async getFilesByFolder(folderPath: string): Promise<MediaFile[]> {
    const allFiles = await this.getAllFiles();
    return allFiles.filter(file => file.folderPath === folderPath);
  }

  // 根据文件夹路径和类型获取文件
  async getFilesByFolderAndType(folderPath: string, type: 'image' | 'video'): Promise<MediaFile[]> {
    const folderFiles = await this.getFilesByFolder(folderPath);
    return folderFiles.filter(file => file.type === type);
  }
}

// 创建单例实例
export const mediaStorage = new MediaStorage();

// 初始化存储
export const initStorage = async (): Promise<void> => {
  await mediaStorage.init();
};

// LocalStorage 用户偏好设置管理
const PREFERENCES_KEY = 'mediaLibraryPreferences';

export const savePreferences = (preferences: any): void => {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('保存用户偏好失败:', error);
  }
};

export const loadPreferences = (): any => {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('加载用户偏好失败:', error);
    return null;
  }
};

export const clearPreferences = (): void => {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
  } catch (error) {
    console.error('清除用户偏好失败:', error);
  }
};