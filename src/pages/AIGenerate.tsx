import React, { useState, useRef } from 'react';
import { Wand2, Image, Video, Download, Copy, RefreshCw, Settings, Sparkles, Palette, Camera, Film, Zap, Heart, Share } from 'lucide-react';
import { Layout } from '../components/layout';
import { useAIStore } from '../store';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { GenerationType, GenerationParams, GenerationTask, GenerationResult } from '../types';

const AIGenerate: React.FC = () => {
  const {
    generationTasks,
    createGenerationTask,
    updateGenerationTask,
    deleteGenerationTask
  } = useAIStore();
  
  const [activeTab, setActiveTab] = useState<GenerationType>('image');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedModel, setSelectedModel] = useState('stable-diffusion');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // 预设风格
  const imageStyles = [
    { id: 'realistic', name: '写实风格', preview: '🎨' },
    { id: 'anime', name: '动漫风格', preview: '🎌' },
    { id: 'oil-painting', name: '油画风格', preview: '🖼️' },
    { id: 'watercolor', name: '水彩风格', preview: '🎭' },
    { id: 'sketch', name: '素描风格', preview: '✏️' },
    { id: 'cyberpunk', name: '赛博朋克', preview: '🌃' },
    { id: 'fantasy', name: '奇幻风格', preview: '🧙‍♂️' },
    { id: 'minimalist', name: '极简风格', preview: '⚪' }
  ];
  
  const videoStyles = [
    { id: 'cinematic', name: '电影风格', preview: '🎬' },
    { id: 'documentary', name: '纪录片', preview: '📹' },
    { id: 'animation', name: '动画风格', preview: '🎞️' },
    { id: 'timelapse', name: '延时摄影', preview: '⏰' },
    { id: 'slowmotion', name: '慢动作', preview: '🐌' },
    { id: 'vintage', name: '复古风格', preview: '📼' }
  ];
  
  // 尺寸比例
  const aspectRatios = [
    { id: '1:1', name: '正方形', size: '1024×1024' },
    { id: '16:9', name: '横屏', size: '1920×1080' },
    { id: '9:16', name: '竖屏', size: '1080×1920' },
    { id: '4:3', name: '标准', size: '1024×768' },
    { id: '3:4', name: '竖版', size: '768×1024' }
  ];
  
  // 模型选项
  const models = {
    image: [
      { id: 'stable-diffusion', name: 'Stable Diffusion XL', description: '高质量图像生成' },
      { id: 'midjourney', name: 'Midjourney', description: '艺术风格图像' },
      { id: 'dall-e', name: 'DALL-E 3', description: 'OpenAI图像生成' }
    ],
    video: [
      { id: 'runway', name: 'Runway Gen-2', description: '专业视频生成' },
      { id: 'pika', name: 'Pika Labs', description: '创意视频制作' },
      { id: 'stable-video', name: 'Stable Video', description: '稳定视频生成' }
    ]
  };
  
  // 提示词建议
  const promptSuggestions = {
    image: [
      '一只可爱的小猫咪坐在窗台上，阳光透过窗户洒在它身上',
      '未来科技城市的夜景，霓虹灯闪烁，飞行汽车穿梭其中',
      '宁静的湖泊倒映着雪山，湖边有一座小木屋',
      '梦幻的森林中，萤火虫在古老的树木间飞舞'
    ],
    video: [
      '海浪轻柔地拍打着沙滩，夕阳西下的美丽景色',
      '雨滴落在玻璃窗上，模糊的城市灯光在背景中闪烁',
      '花朵在春风中轻柔摇摆，蝴蝶在花间飞舞',
      '咖啡杯中的热气缓缓升起，温暖的咖啡厅氛围'
    ]
  };
  
  // 生成内容
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('请输入生成提示词');
      return;
    }
    
    setIsGenerating(true);
    
    const params: GenerationParams = {
      prompt: prompt.trim(),
      width: parseInt(selectedRatio.split('x')[0]),
      height: parseInt(selectedRatio.split('x')[1]),
      aspectRatio: selectedRatio,
      steps: 20,
      guidance: 7.5
    };

    const taskId = createGenerationTask(activeTab as GenerationType, params);
    
    // 模拟生成过程
    setTimeout(() => {
      updateGenerationTask(taskId, {
        status: 'processing',
        progress: 50
      });
      
      // 模拟进度更新
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          // 生成完成
          const mockResult: GenerationResult = {
             id: taskId,
             type: activeTab as GenerationType,
             prompt,
             params,
             url: 'https://picsum.photos/512/512?random=' + Date.now(),
             thumbnailUrl: 'https://picsum.photos/256/256?random=' + Date.now(),
             downloadUrl: 'https://picsum.photos/512/512?random=' + Date.now(),
             width: 512,
             height: 512,
             fileSize: 1024 * 1024 * 2, // 2MB
             status: 'completed',
             progress: 100,
             createdAt: Date.now()
           };

          updateGenerationTask(taskId, {
            status: 'completed',
            progress: 100,
            result: mockResult
          });
          
          setIsGenerating(false);
        } else {
          updateGenerationTask(taskId, {
            progress,
            updatedAt: Date.now()
          });
        }
      }, 200);
    }, 1000);
  };
  
  // 使用建议提示词
  const useSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
  };
  
  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // 下载结果
  const downloadResult = (task: GenerationTask) => {
    if (!task.result) return;
    
    const link = document.createElement('a');
    link.href = task.result.url;
    link.download = `ai-generated-${task.type}-${task.id}.${task.type === 'image' ? 'png' : 'mp4'}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // 复制提示词
  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    // 这里可以添加toast提示
  };
  
  const currentStyles = activeTab === 'image' ? imageStyles : videoStyles;
  const currentModels = models[activeTab];
  const currentSuggestions = promptSuggestions[activeTab];
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 创作工坊</h1>
          <p className="text-gray-600">使用AI技术创作精美的图片和视频内容</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：创作面板 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 类型选择 */}
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <Button
                  variant={activeTab === 'image' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('image')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl ${
                    activeTab === 'image'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Image className="w-5 h-5" />
                  <span>图片生成</span>
                </Button>
                
                <Button
                  variant={activeTab === 'video' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('video')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl ${
                    activeTab === 'video'
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Video className="w-5 h-5" />
                  <span>视频生成</span>
                </Button>
              </div>
              
              {/* 提示词输入 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    创作描述 *
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`描述您想要生成的${activeTab === 'image' ? '图片' : '视频'}内容...`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>
                
                {/* 提示词建议 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    创意灵感
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {currentSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => useSuggestion(suggestion)}
                        className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                      >
                        <Sparkles className="w-4 h-4 inline mr-2 text-yellow-500" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* 负面提示词 */}
                {showAdvanced && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      负面提示词（可选）
                    </label>
                    <textarea
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="描述您不希望出现的内容..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                  </div>
                )}
              </div>
            </Card>
            
            {/* 风格选择 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <Palette className="w-5 h-5 inline mr-2" />
                选择风格
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {currentStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedStyle === style.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{style.preview}</div>
                    <div className="text-sm font-medium text-gray-900">{style.name}</div>
                  </button>
                ))}
              </div>
            </Card>
            
            {/* 参数设置 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  <Settings className="w-5 h-5 inline mr-2" />
                  生成参数
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-600"
                >
                  {showAdvanced ? '简化设置' : '高级设置'}
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 尺寸比例 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    尺寸比例
                  </label>
                  <div className="space-y-2">
                    {aspectRatios.map((ratio) => (
                      <label key={ratio.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="aspectRatio"
                          value={ratio.id}
                          checked={selectedRatio === ratio.id}
                          onChange={(e) => setSelectedRatio(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{ratio.name}</div>
                          <div className="text-xs text-gray-500">{ratio.size}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* 模型选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    生成模型
                  </label>
                  <div className="space-y-2">
                    {currentModels.map((model) => (
                      <label key={model.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="model"
                          value={model.id}
                          checked={selectedModel === model.id}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{model.name}</div>
                          <div className="text-xs text-gray-500">{model.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
            
            {/* 生成按钮 */}
            <Card className="p-6">
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-xl text-lg font-medium"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    开始创作
                  </>
                )}
              </Button>
            </Card>
          </div>
          
          {/* 右侧：生成历史 */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">创作历史</h3>
                <Badge variant="secondary">{generationTasks.length} 个作品</Badge>
              </div>
              
              {generationTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">暂无创作历史</p>
                  <p className="text-sm text-gray-400">开始您的第一个创作吧</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {generationTasks
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .map((task) => (
                    <div key={task.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* 预览图 */}
                      {task.result && (
                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                          {task.type === 'image' ? (
                            <img
                              src={task.result.thumbnailUrl || task.result.url}
                              alt="Generated content"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-900">
                              <Film className="w-12 h-12 text-white" />
                            </div>
                          )}
                          
                          {/* 操作按钮覆盖层 */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => downloadResult(task)}
                                className="bg-white text-gray-900 hover:bg-gray-100"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => copyPrompt(task.params.prompt)}
                                className="bg-white text-gray-900 hover:bg-gray-100"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-white text-gray-900 hover:bg-gray-100"
                              >
                                <Heart className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* 任务信息 */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.type === 'image' ? '图片' : '视频'}
                          </Badge>
                          
                          <div className="flex items-center space-x-1">
                            {task.type === 'image' ? (
                              <Image className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Video className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {task.params.prompt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{new Date(task.createdAt).toLocaleString()}</span>
                          {task.result && (
                            <span>{formatFileSize(task.result.fileSize)}</span>
                          )}
                        </div>
                        
                        {/* 进度条 */}
                        {task.status === 'processing' && task.progress !== undefined && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>生成进度</span>
                              <span>{task.progress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
            
            {/* 快捷操作 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h3>
              
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => {
                    setPrompt('');
                    setNegativePrompt('');
                    setSelectedStyle('realistic');
                    setSelectedRatio('1:1');
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-3" />
                  重置所有设置
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left"
                >
                  <Share className="w-4 h-4 mr-3" />
                  分享创作作品
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left"
                >
                  <Zap className="w-4 h-4 mr-3" />
                  批量生成
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default AIGenerate;