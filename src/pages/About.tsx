import React from 'react';
import { Layout } from '../components/layout';
import { 
  Sparkles, 
  MessageSquare, 
  Mic, 
  Wand2, 
  Image, 
  Video, 
  Settings,
  Users,
  Code,
  Palette,
  Zap,
  Shield
} from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      icon: <Image className="w-6 h-6" />,
      title: '素材管理',
      description: '智能化的图片和视频展示与管理系统'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'AI对话',
      description: '支持多种AI模型的智能对话功能'
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: '录音分析',
      description: '专业的音频内容分析和处理工具'
    },
    {
      icon: <Wand2 className="w-6 h-6" />,
      title: 'AI生成',
      description: '强大的AI内容生成和创作助手'
    }
  ];

  const techStack = [
    { name: 'React 18', description: '现代化前端框架' },
    { name: 'TypeScript', description: '类型安全的JavaScript' },
    { name: 'Tailwind CSS', description: '实用优先的CSS框架' },
    { name: 'Zustand', description: '轻量级状态管理' },
    { name: 'Vite', description: '快速构建工具' },
    { name: 'React Router', description: '客户端路由管理' }
  ];

  const designFeatures = [
    {
      icon: <Palette className="w-5 h-5" />,
      title: '苹果设计风格',
      description: '简洁优雅的用户界面设计'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: '响应式布局',
      description: '完美适配桌面和移动设备'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: '本地优先',
      description: '数据安全，隐私保护'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* 头部介绍 */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              AI中台
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              集成本地素材管理和AI功能服务的智能化平台，为创作者、设计师和内容制作者提供专业的AI工具集
            </p>
          </div>

          {/* 核心功能 */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              核心功能
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 技术栈 */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              技术栈
            </h2>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {techStack.map((tech, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{tech.name}</h4>
                      <p className="text-sm text-gray-600">{tech.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 设计特色 */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              设计特色
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {designFeatures.map((feature, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg mb-4 text-blue-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 目标用户 */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              目标用户
            </h2>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
              <div className="flex items-center justify-center mb-6">
                <Users className="w-12 h-12" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">专业创作者</h3>
                <p className="text-blue-100 max-w-2xl mx-auto leading-relaxed">
                  为创作者、设计师、内容制作者、开发者等专业人士提供高效的AI工具，
                  助力创意实现和生产力提升
                </p>
              </div>
            </div>
          </div>

          {/* 版本信息 */}
          <div className="text-center">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 inline-block">
              <div className="flex items-center justify-center mb-4">
                <Code className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                版本信息
              </h3>
              <p className="text-gray-600 mb-1">当前版本：v1.0.0</p>
              <p className="text-gray-600 mb-4">构建工具：Vite + React</p>
              <div className="text-sm text-gray-500">
                <p>© 2024 AI中台项目</p>
                <p>基于现代Web技术构建</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;