// 媒体文件API服务

export interface MediaFileInfo {
  id: string;
  name: string;
  type: 'image' | 'video';
  size: number;
  lastModified: number;
  url: string;
  thumbnail?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  folderPath?: string;
}

export interface MediaApiResponse {
  success: boolean;
  data: MediaFileInfo[];
  message?: string;
}

const API_BASE_URL = '';
const IMAGE_BASE_URL = `${API_BASE_URL}/uploads/Image/`;
const VIDEO_BASE_URL = `${API_BASE_URL}/uploads/Video/`;

/**
 * 获取图片列表
 */
export async function fetchImages(): Promise<MediaFileInfo[]> {
  try {
    console.log('正在请求图片列表:', `${API_BASE_URL}/api/files/images`);
    const response = await fetch(`${API_BASE_URL}/api/files/images`);

    console.log('图片API响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: MediaApiResponse = await response.json();
    console.log('图片API响应数据:', result);
    
    if (!result.success) {
      throw new Error(result.message || '获取图片列表失败');
    }

    // 为每个图片添加完整的URL
    return result.data.map(file => ({
      ...file,
      url: file.url || `${IMAGE_BASE_URL}${file.name}`,
      thumbnail: file.thumbnail ? `${IMAGE_BASE_URL}${file.thumbnail}` : undefined,
      type: 'image' as const
    }));
  } catch (error) {
    console.error('获取图片列表失败:', error);
    throw error;
  }
}

/**
 * 获取视频列表
 */
export async function fetchVideos(): Promise<MediaFileInfo[]> {
  try {
    console.log('正在请求视频列表:', `${API_BASE_URL}/api/files/videos`);
    const response = await fetch(`${API_BASE_URL}/api/files/videos`);

    console.log('视频API响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: MediaApiResponse = await response.json();
    console.log('视频API响应数据:', result);
    
    if (!result.success) {
      throw new Error(result.message || '获取视频列表失败');
    }

    // 为每个视频添加完整的URL
    return result.data.map(file => ({
      ...file,
      url: `${VIDEO_BASE_URL}${file.name}`,
      thumbnail: file.thumbnail ? `${VIDEO_BASE_URL}${file.thumbnail}` : undefined,
      type: 'video' as const
    }));
  } catch (error) {
    console.error('获取视频列表失败:', error);
    throw error;
  }
}

/**
 * 通过API下载文件（带权限控制）
 */
export async function downloadFile(fileId: string): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/download`, {
      method: 'GET',
      credentials: 'include', // 包含认证信息
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('下载文件失败:', error);
    throw error;
  }
}

/**
 * 获取文件的安全访问URL（带权限验证）
 */
export async function getSecureFileUrl(fileId: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}/url`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error('获取安全文件URL失败:', error);
    throw error;
  }
}

/**
 * 上传文件到服务器
 */
export async function uploadFile(file: File, type: 'image' | 'video'): Promise<MediaFileInfo> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '文件上传失败');
    }

    return result.data;
  } catch (error) {
    console.error('文件上传失败:', error);
    throw error;
  }
}

/**
 * 删除文件
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/${fileId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || '文件删除失败');
    }
  } catch (error) {
    console.error('文件删除失败:', error);
    throw error;
  }
}