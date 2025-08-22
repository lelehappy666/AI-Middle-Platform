import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Image, Video, FolderOpen, Upload, Play, Eye, Calendar, HardDrive } from 'lucide-react';
import { Layout, PageContainer, GridLayout } from '../components/layout';
import { Button, Card, CardContent, Badge } from '../components/ui';
import { useMediaStore } from '../store/mediaStore';
import { formatFileSize, formatNumber } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className="flex items-center mt-2">
                <span className={`text-xs font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs 上月</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  href: string;
  gradient: string;
  iconBg: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  icon,
  count,
  href,
  gradient,
  iconBg
}) => {
  return (
    <Link to={href} className="group">
      <Card className="h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-0 overflow-hidden">
        <div className={`h-2 ${gradient}`} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <Badge variant="secondary" className="text-xs">
              {formatNumber(count)} 个文件
            </Badge>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {description}
          </p>
          <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
            <span>浏览 {title.toLowerCase()}</span>
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const Home: React.FC = () => {
  const { files, loadFiles, isLoading } = useMediaStore();
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalImages: 0,
    totalVideos: 0,
    totalSize: 0
  });

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    const images = files.filter(file => file.type === 'image');
    const videos = files.filter(file => file.type === 'video');
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    setStats({
      totalFiles: files.length,
      totalImages: images.length,
      totalVideos: videos.length,
      totalSize
    });
  }, [files]);

  const handleFolderUpload = async () => {
    try {
      const { selectDirectoryAndGetImages } = await import('../lib/fileSystem');
      const { addFilesWithProgress } = useMediaStore.getState();
      
      const result = await selectDirectoryAndGetImages((current, total, currentPath) => {
        // 这里可以添加进度显示逻辑
        console.log(`处理进度: ${current}/${total} - ${currentPath}`);
      });
      
      if (result.files.length > 0) {
        await addFilesWithProgress(result.files);
        console.log(`成功导入 ${result.files.length} 个文件从文件夹: ${result.directoryName}`);
      }
    } catch (error) {
      console.error('文件夹导入失败:', error);
    }
  };

  const statCards = [
    {
      title: '总文件数',
      value: formatNumber(stats.totalFiles),
      icon: <FolderOpen className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-100',
      trend: { value: 12, isPositive: true }
    },
    {
      title: '图片文件',
      value: formatNumber(stats.totalImages),
      icon: <Image className="w-6 h-6 text-green-600" />,
      color: 'bg-green-100',
      trend: { value: 8, isPositive: true }
    },
    {
      title: '视频文件',
      value: formatNumber(stats.totalVideos),
      icon: <Video className="w-6 h-6 text-purple-600" />,
      color: 'bg-purple-100',
      trend: { value: 15, isPositive: true }
    },
    {
      title: '存储空间',
      value: formatFileSize(stats.totalSize),
      icon: <HardDrive className="w-6 h-6 text-orange-600" />,
      color: 'bg-orange-100'
    }
  ];

  const categoryCards = [
    {
      title: '图片库',
      description: '浏览和管理您的图片收藏，支持多种格式的图片文件预览和编辑。',
      icon: <Image className="w-6 h-6 text-white" />,
      count: stats.totalImages,
      href: '/images',
      gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-500'
    },
    {
      title: '视频库',
      description: '管理您的视频文件，支持在线预览和播放多种视频格式。',
      icon: <Play className="w-6 h-6 text-white" />,
      count: stats.totalVideos,
      href: '/videos',
      gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
      iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500'
    },
    {
      title: '最近查看',
      description: '快速访问您最近查看过的图片和视频文件。',
      icon: <Eye className="w-6 h-6 text-white" />,
      count: Math.min(stats.totalFiles, 20),
      href: '/recent',
      gradient: 'bg-gradient-to-r from-green-500 to-teal-500',
      iconBg: 'bg-gradient-to-br from-green-500 to-teal-500'
    }
  ];

  return (
    <Layout>
      <PageContainer>
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              本地媒体
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                展示平台
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              优雅地管理和预览您的本地图片与视频文件，享受苹果风格的流畅体验
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={handleFolderUpload}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FolderOpen className="w-5 h-5 mr-2" />
              添加文件夹
            </Button>
            <Link to="/images">
              <Button
                variant="secondary"
                size="lg"
                className="px-8 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
              >
                <Eye className="w-5 h-5 mr-2" />
                浏览媒体库
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-600" />
            统计概览
          </h2>
          <GridLayout columns={4} gap="lg" responsive>
            {statCards.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </GridLayout>
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <FolderOpen className="w-6 h-6 mr-2 text-blue-600" />
            媒体分类
          </h2>
          <GridLayout columns={3} gap="lg" responsive>
            {categoryCards.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </GridLayout>
        </div>

        {/* Quick Actions */}
        {stats.totalFiles === 0 && !isLoading && (
          <div className="mt-12 text-center">
            <Card className="max-w-md mx-auto border-2 border-dashed border-gray-300 bg-gray-50">
              <CardContent className="p-8">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderOpen className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    还没有媒体文件
                  </h3>
                  <p className="text-gray-600 mb-6">
                    开始添加您的图片和视频文件来构建您的媒体库
                  </p>
                </div>
                <Button
                  onClick={handleFolderUpload}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  添加文件夹
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </PageContainer>
    </Layout>
  );
};

export default Home;