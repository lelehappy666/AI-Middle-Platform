import React from 'react';
import { Folder, Image as ImageIcon, Video, Clock, FileText } from 'lucide-react';
import { Card, CardContent } from './ui';
import { FolderInfo } from '../types';
import { formatFileSize, formatDate, cn } from '../lib/utils';

interface FolderViewProps {
  folders: FolderInfo[];
  onFolderClick: (folderPath: string) => void;
  loading?: boolean;
  className?: string;
}

export const FolderView: React.FC<FolderViewProps> = ({
  folders,
  onFolderClick,
  loading = false,
  className
}) => {
  console.log('🖼️ [FolderView] 组件渲染，接收到的数据:', {
    foldersCount: folders.length,
    loading,
    folders: folders.map(f => ({
      name: f.name,
      path: f.path,
      fileCount: f.fileCount,
      hasThumbnail: !!f.thumbnail
    }))
  });
  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6', className)}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Folder className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文件夹</h3>
        <p className="text-gray-500 max-w-md">
          还没有导入任何文件夹。点击"选择文件夹"按钮开始导入您的图片和视频文件。
        </p>
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6', className)}>
      {folders.map((folder) => (
        <Card 
          key={folder.path} 
          className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          onClick={() => onFolderClick(folder.path)}
        >
          <CardContent className="p-0">
            {/* 文件夹缩略图 */}
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg relative overflow-hidden">
              {folder.thumbnail ? (
                <img
                  src={folder.thumbnail}
                  alt={folder.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Folder className="w-12 h-12 text-blue-400" />
                </div>
              )}
              
              {/* 文件数量徽章 */}
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {folder.fileCount}
              </div>
            </div>
            
            {/* 文件夹信息 */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 truncate flex-1 mr-2 group-hover:text-blue-600 transition-colors">
                  {folder.name}
                </h3>
                <Folder className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(folder.lastModified)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <span>{folder.fileCount} 个文件</span>
                </div>
              </div>
              
              {/* 文件夹路径提示 */}
              <div className="mt-2 text-xs text-gray-400 truncate" title={folder.path}>
                {folder.path}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FolderView;