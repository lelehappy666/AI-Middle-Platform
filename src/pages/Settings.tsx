import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings as SettingsIcon, Plus, Trash2, Edit3, Save, X, Check, AlertCircle, Key, Globe, Palette, Bell, Shield, User, Database, Cpu, Zap } from 'lucide-react';
import { Layout } from '../components/layout';
import { useAIStore, selectAIChatModels, selectAudioAnalysisModels, selectImageGenerationModels, selectVideoGenerationModels, selectPPTGenerationModels } from '../store';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AIProvider, AIModel } from '../types';

const Settings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const {
    settings,
    updateSettings,
    addAIModel,
    updateAIModel,
    deleteAIModel
  } = useAIStore();
  
  // 从store获取分类模型数据
  const storeAIChatModels = useAIStore(selectAIChatModels);
  const storeAudioAnalysisModels = useAIStore(selectAudioAnalysisModels);
  const storeImageGenerationModels = useAIStore(selectImageGenerationModels);
  const storeVideoGenerationModels = useAIStore(selectVideoGenerationModels);
  const storePPTGenerationModels = useAIStore(selectPPTGenerationModels);
  
  const [activeTab, setActiveTab] = useState('ai-chat-models');
  
  // 根据URL参数设置活动选项卡
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [newModel, setNewModel] = useState<Partial<AIModel>>({});
  const [showAddModel, setShowAddModel] = useState(false);
  const [currentModelType, setCurrentModelType] = useState<'chat' | 'audio' | 'image' | 'video' | 'ppt'>('chat');
  
  // 本地状态用于UI展示，从store同步数据
  const [aiChatModels, setAIChatModels] = useState<AIModel[]>([]);
  const [audioAnalysisModels, setAudioAnalysisModels] = useState<AIModel[]>([]);
  const [imageGenerationModels, setImageGenerationModels] = useState<AIModel[]>([]);
  const [videoGenerationModels, setVideoGenerationModels] = useState<AIModel[]>([]);
  const [pptGenerationModels, setPPTGenerationModels] = useState<AIModel[]>([]);
  
  // 连接测试loading状态
  const [loadingModels, setLoadingModels] = useState<Set<string>>(new Set());
  
  // 从store同步数据到本地状态
  useEffect(() => {
    setAIChatModels(storeAIChatModels || []);
  }, [storeAIChatModels]);
  
  useEffect(() => {
    setAudioAnalysisModels(storeAudioAnalysisModels || []);
  }, [storeAudioAnalysisModels]);
  
  useEffect(() => {
    setImageGenerationModels(storeImageGenerationModels || []);
  }, [storeImageGenerationModels]);
  
  useEffect(() => {
    setVideoGenerationModels(storeVideoGenerationModels || []);
  }, [storeVideoGenerationModels]);
  
  useEffect(() => {
    setPPTGenerationModels(storePPTGenerationModels || []);
  }, [storePPTGenerationModels]);
  
  // 设置选项卡
  const settingTabs = [
    {
      id: 'ai-chat-models',
      name: 'AI对话大模型',
      icon: Cpu,
      description: '管理AI对话模型配置'
    },
    {
      id: 'audio-analysis-models',
      name: '录音分析大模型',
      icon: Database,
      description: '管理录音分析模型配置'
    },
    {
      id: 'image-generation-models',
      name: '图片生成大模型',
      icon: Zap,
      description: '管理图片生成模型配置'
    },
    {
      id: 'video-generation-models',
      name: '视频生成大模型',
      icon: Zap,
      description: '管理视频生成模型配置'
    },
    {
      id: 'ppt-generation-models',
      name: 'PPT生成大模型',
      icon: Zap,
      description: '管理PPT生成模型配置'
    },
    {
      id: 'general',
      name: '通用设置',
      icon: SettingsIcon,
      description: '基本应用设置'
    },
    {
      id: 'appearance',
      name: '外观',
      icon: Palette,
      description: '主题和界面设置'
    },
    {
      id: 'notifications',
      name: '通知',
      icon: Bell,
      description: '通知偏好设置'
    },
    {
      id: 'privacy',
      name: '隐私',
      icon: Shield,
      description: '隐私和安全设置'
    },
    {
      id: 'account',
      name: '账户',
      icon: User,
      description: '账户信息管理'
    }
  ];
  
  // AI提供商选项
  const providerOptions: { value: AIProvider; label: string; description: string }[] = [
    { value: 'openai', label: 'OpenAI', description: 'GPT系列模型' },
    { value: 'anthropic', label: 'Anthropic', description: 'Claude系列模型' },
    { value: 'google', label: 'Google', description: 'Gemini系列模型' },
    { value: 'azure', label: 'Azure OpenAI', description: 'Azure托管的OpenAI服务' },
    { value: 'deepseek', label: 'DeepSeek', description: 'DeepSeek免费API模型' },    { value: '硅基流动', label: '硅基流动', description: '硅基流动免费API模型' },
    { value: 'custom', label: '自定义', description: '自定义API端点' }
  ];
  
  // 保存模型
  const handleSaveModel = () => {
    if (!newModel.name || !newModel.provider || !newModel.apiKey) {
      alert('请填写完整的模型信息');
      return;
    }
    
    const modelToSave: AIModel = {
      id: newModel.id || `${newModel.provider}-${Date.now()}`,
      name: newModel.name,
      provider: newModel.provider,
      apiKey: newModel.apiKey,
      baseUrl: newModel.baseUrl,
      model: newModel.model || newModel.name,
      isEnabled: newModel.isEnabled ?? true,
      maxTokens: newModel.maxTokens || 4096,
      temperature: newModel.temperature || 0.7,
      createdAt: newModel.createdAt || Date.now()
    };
    
    // 根据当前模型类型保存到对应的状态数组
    switch (currentModelType) {
      case 'chat':
        if (editingModel) {
          setAIChatModels(aiChatModels.map(model =>
            model.id === editingModel ? modelToSave : model
          ));
          // 同步到store
          updateAIModel(editingModel, modelToSave, 'aiChat');
        } else {
          setAIChatModels([...aiChatModels, modelToSave]);
          // 同步到store
          addAIModel(modelToSave, 'aiChat');
        }
        break;
      case 'audio':
        if (editingModel) {
          setAudioAnalysisModels(audioAnalysisModels.map(model => 
            model.id === editingModel ? modelToSave : model
          ));
          updateAIModel(editingModel, modelToSave, 'audioAnalysis');
        } else {
          setAudioAnalysisModels([...audioAnalysisModels, modelToSave]);
          addAIModel(modelToSave, 'audioAnalysis');
        }
        break;
      case 'image':
        if (editingModel) {
          setImageGenerationModels(imageGenerationModels.map(model => 
            model.id === editingModel ? modelToSave : model
          ));
          updateAIModel(editingModel, modelToSave, 'imageGeneration');
        } else {
          setImageGenerationModels([...imageGenerationModels, modelToSave]);
          addAIModel(modelToSave, 'imageGeneration');
        }
        break;
      case 'video':
        if (editingModel) {
          setVideoGenerationModels(videoGenerationModels.map(model => 
            model.id === editingModel ? modelToSave : model
          ));
          updateAIModel(editingModel, modelToSave, 'videoGeneration');
        } else {
          setVideoGenerationModels([...videoGenerationModels, modelToSave]);
          addAIModel(modelToSave, 'videoGeneration');
        }
        break;
      case 'ppt':
        if (editingModel) {
          setPPTGenerationModels(pptGenerationModels.map(model =>
            model.id === editingModel ? modelToSave : model
          ));
          updateAIModel(editingModel, modelToSave, 'pptGeneration');
        } else {
          setPPTGenerationModels([...pptGenerationModels, modelToSave]);
          addAIModel(modelToSave, 'pptGeneration');
        }
        break;
      default:
        console.error('Unknown model type:', currentModelType);
        return;
    }
    
    // 重置状态
    setShowAddModel(false);
    setEditingModel(null);
    setCurrentModelType('chat');
    setNewModel({
      name: '',
      provider: 'openai',
      apiKey: '',
      model: '',
      baseUrl: '',
      maxTokens: 4000,
      temperature: 0.7,
      isEnabled: true
    });
  };
  
  // 编辑模型
  const handleEditModel = (model: AIModel, modelType?: string) => {
    setNewModel(model);
    setEditingModel(model.id);
    if (modelType) {
      setCurrentModelType(modelType as 'chat' | 'audio' | 'image' | 'video' | 'ppt');
    }
    setShowAddModel(true);
  };
  
  // 删除模型
  const handleDeleteModel = (modelId: string, modelType?: string) => {
    if (confirm('确定要删除这个AI模型吗？')) {
      const type = modelType || currentModelType;
      switch (type) {
        case 'chat':
          setAIChatModels(prev => prev.filter(m => m.id !== modelId));
          // 同步到store
          deleteAIModel(modelId, 'aiChat');
          break;
        case 'audio':
          setAudioAnalysisModels(prev => prev.filter(m => m.id !== modelId));
          deleteAIModel(modelId, 'audioAnalysis');
          break;
        case 'image':
          setImageGenerationModels(prev => prev.filter(m => m.id !== modelId));
          deleteAIModel(modelId, 'imageGeneration');
          break;
        case 'video':
          setVideoGenerationModels(prev => prev.filter(m => m.id !== modelId));
          deleteAIModel(modelId, 'videoGeneration');
          break;
        case 'ppt':
          setPPTGenerationModels(prev => prev.filter(m => m.id !== modelId));
          deleteAIModel(modelId, 'pptGeneration');
          break;
        default:
          console.error('Unknown model type:', type);
      }
    }
  };
  
  // 模拟模型连接测试（纯前端实现）
  const testModelConnection = async (model: AIModel): Promise<{ success: boolean; error?: string }> => {
    console.log('Testing connection for model (mock):', {
      name: model.name,
      provider: model.provider,
      model: model.model,
      hasApiKey: !!model.apiKey
    });
    
    // 基本参数验证
    if (!model.apiKey || model.apiKey.trim() === '') {
      return { success: false, error: 'API Key不能为空' };
    }
    
    if (!model.model || model.model.trim() === '') {
      return { success: false, error: '模型名称不能为空' };
    }
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // 简单的API Key格式验证
    const apiKeyPatterns = {
      openai: /^sk-[a-zA-Z0-9]{48,}$/,
      anthropic: /^sk-ant-[a-zA-Z0-9-]{95,}$/,
      google: /^[a-zA-Z0-9_-]{30,}$/,
      deepseek: /^sk-[a-zA-Z0-9]{48,}$/,
      '硅基流动': /^sk-[a-zA-Z0-9]{48,}$/
    };
    
    const pattern = apiKeyPatterns[model.provider as keyof typeof apiKeyPatterns];
    if (pattern && !pattern.test(model.apiKey)) {
      return { success: false, error: `${model.provider} API Key格式不正确` };
    }
    
    // 模拟随机成功/失败（90%成功率）
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      console.log('Connection test successful (mock)');
      return { success: true };
    } else {
      return { 
        success: false, 
        error: '模拟连接失败 - 请检查API配置'
      };
    }
  };
  
  // getDefaultBaseUrl函数已移除（纯前端模拟实现中不需要）
  
  // 切换模型启用状态
  const toggleModelEnabled = async (modelId: string, enabled: boolean, modelType?: string) => {
    const type = modelType || currentModelType;
    
    // 如果是启用模型，先进行连接测试
    if (enabled) {
      const model = getModelById(modelId, type);
      if (!model) {
        alert('模型不存在');
        return;
      }
      
      // 检查API密钥
      if (!model.apiKey || model.apiKey.trim() === '') {
        alert('请先配置API密钥');
        return;
      }
      
      // 设置loading状态
      setLoadingModels(prev => new Set([...prev, modelId]));
      
      try {
        const testResult = await testModelConnection(model);
        
        if (!testResult.success) {
          alert(`连接测试失败：${testResult.error}\n\n请检查：\n1. API密钥是否正确\n2. 网络连接是否正常\n3. API地址是否可访问`);
          // 连接失败时，设置为未连接状态
        const updateModel = (models: AIModel[]) => 
          models.map(m => m.id === modelId ? { ...m, isEnabled: false, isConnected: false } : m);
        
        const updatedModel = { ...getModelById(modelId, type)!, isEnabled: false, isConnected: false };
        
        switch (type) {
          case 'chat':
            setAIChatModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'aiChat');
            break;
          case 'audio':
            setAudioAnalysisModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'audioAnalysis');
            break;
          case 'image':
            setImageGenerationModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'imageGeneration');
            break;
          case 'video':
            setVideoGenerationModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'videoGeneration');
            break;
          case 'ppt':
            setPPTGenerationModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'pptGeneration');
            break;
        }
          return;
        }
        
        alert('连接测试成功！模型已启用。');
        // 连接成功时，设置为已连接且已启用状态
        const updateModel = (models: AIModel[]) => 
          models.map(m => m.id === modelId ? { ...m, isEnabled: true, isConnected: true } : m);
        
        const updatedModel = { ...getModelById(modelId, type)!, isEnabled: true, isConnected: true };
        
        switch (type) {
          case 'chat':
            setAIChatModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'aiChat');
            break;
          case 'audio':
            setAudioAnalysisModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'audioAnalysis');
            break;
          case 'image':
            setImageGenerationModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'imageGeneration');
            break;
          case 'video':
            setVideoGenerationModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'videoGeneration');
            break;
          case 'ppt':
            setPPTGenerationModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'pptGeneration');
            break;
        }
        
      } catch (error) {
        alert('连接测试异常，请稍后重试');
        // 连接异常时，设置为未连接状态
        const updateModel = (models: AIModel[]) => 
          models.map(m => m.id === modelId ? { ...m, isEnabled: false, isConnected: false } : m);
        
        const updatedModel = { ...getModelById(modelId, type)!, isEnabled: false, isConnected: false };
        
        switch (type) {
          case 'chat':
            setAIChatModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'aiChat');
            break;
          case 'audio':
            setAudioAnalysisModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'audioAnalysis');
            break;
          case 'image':
            setImageGenerationModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'imageGeneration');
            break;
          case 'video':
            setVideoGenerationModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'videoGeneration');
            break;
          case 'ppt':
            setPPTGenerationModels(prev => updateModel(prev));
            updateAIModel(modelId, updatedModel, 'pptGeneration');
            break;
        }
        return;
      } finally {
        // 清除loading状态
        setLoadingModels(prev => {
          const newSet = new Set(prev);
          newSet.delete(modelId);
          return newSet;
        });
      }
    } else {
      // 禁用模型时，只需要更新启用状态，保持连接状态
      const updateModel = (models: AIModel[]) => 
        models.map(m => m.id === modelId ? { ...m, isEnabled: false } : m);
      
      const updatedModel = { ...getModelById(modelId, type)!, isEnabled: false };
      
      switch (type) {
        case 'chat':
          setAIChatModels(prev => updateModel(prev));
          updateAIModel(modelId, updatedModel, 'aiChat');
          break;
        case 'audio':
          setAudioAnalysisModels(prev => updateModel(prev));
          updateAIModel(modelId, updatedModel, 'audioAnalysis');
          break;
        case 'image':
          setImageGenerationModels(prev => updateModel(prev));
          updateAIModel(modelId, updatedModel, 'imageGeneration');
          break;
        case 'video':
          setVideoGenerationModels(prev => updateModel(prev));
          updateAIModel(modelId, updatedModel, 'videoGeneration');
          break;
        case 'ppt':
          setPPTGenerationModels(prev => updateModel(prev));
          updateAIModel(modelId, updatedModel, 'pptGeneration');
          break;
        default:
          console.error('Unknown model type:', type);
      }
    }
  };
  
  // 根据ID获取模型
  const getModelById = (modelId: string, type: string): AIModel | undefined => {
    switch (type) {
      case 'chat':
        return aiChatModels.find(m => m.id === modelId);
      case 'audio':
        return audioAnalysisModels.find(m => m.id === modelId);
      case 'image':
        return imageGenerationModels.find(m => m.id === modelId);
      case 'video':
        return videoGenerationModels.find(m => m.id === modelId);
      case 'ppt':
        return pptGenerationModels.find(m => m.id === modelId);
      default:
        return undefined;
    }
  };
  
  // 设置默认模型
  const setDefaultModel = (modelId: string, type: 'chat' | 'generation') => {
    const updates = type === 'chat' 
      ? { defaultChatModel: modelId }
      : { defaultGenerationModel: modelId };
    updateSettings(updates);
  };
  
  // 取消编辑
  const handleCancelEdit = () => {
    setShowAddModel(false);
    setEditingModel(null);
    setNewModel({});
  };
  
  // 渲染AI对话大模型设置
  const renderAIChatModelsTab = () => (
    <div className="space-y-6">
      {/* 添加模型按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI对话大模型配置</h3>
          <p className="text-sm text-gray-600">管理您的AI对话模型和API密钥</p>
        </div>
        <Button
          onClick={() => { setCurrentModelType('chat'); setShowAddModel(true); }}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加对话模型
        </Button>
      </div>
      
      {/* 模型列表 */}
      <div className="space-y-4">
        {aiChatModels.length === 0 ? (
          <Card className="p-8 text-center">
            <Cpu className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无AI对话模型</h3>
            <p className="text-gray-600 mb-4">添加您的第一个AI对话模型开始使用</p>
            <Button
              onClick={() => { setCurrentModelType('chat'); setShowAddModel(true); }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加模型
            </Button>
          </Card>
        ) : (
          aiChatModels.map((model) => (
            <Card key={model.id} className="p-6" data-model-id={model.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{model.name}</h4>
                    <Badge className={`${
                      model.isEnabled && model.isConnected ? 'bg-green-100 text-green-800' : 
                      model.isConnected === false ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {model.isEnabled && model.isConnected ? '已启用' : 
                       model.isConnected === false ? '未连接' : '已禁用'}
                    </Badge>
                    {settings.defaultChatModel === model.id && (
                      <Badge className="bg-blue-100 text-blue-800">默认对话</Badge>
                    )}
                    {settings.defaultGenerationModel === model.id && (
                      <Badge className="bg-purple-100 text-purple-800">默认生成</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">提供商：</span>
                      {providerOptions.find(p => p.value === model.provider)?.label || model.provider}
                    </div>
                    <div>
                      <span className="font-medium">模型：</span>
                      {model.model}
                    </div>
                    <div>
                      <span className="font-medium">最大令牌：</span>
                      {model.maxTokens?.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">温度：</span>
                      {model.temperature}
                    </div>
                    {model.baseUrl && (
                      <div className="md:col-span-2">
                        <span className="font-medium">API地址：</span>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded ml-2">
                          {model.baseUrl}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toggleModelEnabled(model.id, !model.isEnabled, 'chat');
                    }}
                    disabled={loadingModels.has(model.id)}
                    className={model.isEnabled ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                  >
                    {loadingModels.has(model.id) ? '连接中...' : (model.isEnabled ? '禁用' : '启用')}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditModel(model, 'chat')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteModel(model.id, 'chat')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* 快捷操作 */}
              {model.isEnabled && model.isConnected && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">设为默认：</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefaultModel(model.id, 'chat')}
                      className={`${
                        settings.defaultChatModel === model.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      对话模型
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDefaultModel(model.id, 'generation')}
                      className={`${
                        settings.defaultGenerationModel === model.id
                          ? 'bg-purple-100 text-purple-700'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      生成模型
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
      
      {/* 添加/编辑模型弹窗 */}
      {showAddModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingModel ? '编辑AI模型' : '添加AI模型'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      模型名称 *
                    </label>
                    <input
                      type="text"
                      value={newModel.name || ''}
                      onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                      placeholder="例如：GPT-4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      提供商 *
                    </label>
                    <select
                      value={newModel.provider || ''}
                      onChange={(e) => setNewModel({ ...newModel, provider: e.target.value as AIProvider })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">选择提供商</option>
                      {providerOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* API配置 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API密钥 *
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="password"
                        value={newModel.apiKey || ''}
                        onChange={(e) => setNewModel({ ...newModel, apiKey: e.target.value })}
                        placeholder="输入API密钥"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      模型标识
                    </label>
                    <input
                      type="text"
                      value={newModel.model || ''}
                      onChange={(e) => setNewModel({ ...newModel, model: e.target.value })}
                      placeholder="例如：gpt-4-turbo-preview"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {(newModel.provider === 'custom' || newModel.provider === 'azure') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API地址
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          value={newModel.baseUrl || ''}
                          onChange={(e) => setNewModel({ ...newModel, baseUrl: e.target.value })}
                          placeholder="https://api.example.com/v1"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 高级参数 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      最大令牌数
                    </label>
                    <input
                      type="number"
                      value={newModel.maxTokens || 4096}
                      onChange={(e) => setNewModel({ ...newModel, maxTokens: parseInt(e.target.value) })}
                      min="1"
                      max="128000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      温度 (0-2)
                    </label>
                    <input
                      type="number"
                      value={newModel.temperature || 0.7}
                      onChange={(e) => setNewModel({ ...newModel, temperature: parseFloat(e.target.value) })}
                      min="0"
                      max="2"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* 启用状态 */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={newModel.isEnabled ?? true}
                    onChange={(e) => setNewModel({ ...newModel, isEnabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                    启用此模型
                  </label>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={handleCancelEdit}
                  className="text-gray-600 hover:text-gray-800"
                >
                  取消
                </Button>
                <Button
                  onClick={handleSaveModel}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingModel ? '保存更改' : '添加模型'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
  
  // 渲染录音分析大模型设置
  const renderAudioAnalysisModelsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">录音分析大模型配置</h3>
          <p className="text-sm text-gray-600">管理您的录音分析模型和API密钥</p>
        </div>
        <Button
          onClick={() => { setCurrentModelType('audio'); setShowAddModel(true); }}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加分析模型
        </Button>
      </div>
      
      <div className="space-y-4">
        {audioAnalysisModels.length === 0 ? (
          <Card className="p-8 text-center">
            <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无录音分析模型</h3>
            <p className="text-gray-600 mb-4">添加您的第一个录音分析模型开始使用</p>
            <Button
              onClick={() => { setCurrentModelType('audio'); setShowAddModel(true); }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加模型
            </Button>
          </Card>
        ) : (
          audioAnalysisModels.map((model) => (
            <Card key={model.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{model.name}</h4>
                    <Badge className={`${
                      model.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {model.isEnabled ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>提供商: {model.provider}</div>
                    <div>模型: {model.model}</div>
                    <div>最大令牌: {model.maxTokens}</div>
                    <div>温度: {model.temperature}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toggleModelEnabled(model.id, !model.isEnabled, 'audio');
                    }}
                    disabled={loadingModels.has(model.id)}
                    className={model.isEnabled ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                  >
                    {loadingModels.has(model.id) ? '连接中...' : (model.isEnabled ? '禁用' : '启用')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditModel(model, 'audio')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteModel(model.id, 'audio')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
  
  // 渲染图片生成大模型设置
  const renderImageGenerationModelsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">图片生成大模型配置</h3>
          <p className="text-sm text-gray-600">管理您的图片生成模型和API密钥</p>
        </div>
        <Button
          onClick={() => { setCurrentModelType('image'); setShowAddModel(true); }}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加生成模型
        </Button>
      </div>
      
      <div className="space-y-4">
        {imageGenerationModels.length === 0 ? (
          <Card className="p-8 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无图片生成模型</h3>
            <p className="text-gray-600 mb-4">添加您的第一个图片生成模型开始使用</p>
            <Button
              onClick={() => { setCurrentModelType('image'); setShowAddModel(true); }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加模型
            </Button>
          </Card>
        ) : (
          imageGenerationModels.map((model) => (
            <Card key={model.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{model.name}</h4>
                    <Badge className={`${
                      model.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {model.isEnabled ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>提供商: {model.provider}</div>
                    <div>模型: {model.model}</div>
                    <div>最大令牌: {model.maxTokens}</div>
                    <div>温度: {model.temperature}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toggleModelEnabled(model.id, !model.isEnabled, 'image');
                    }}
                    disabled={loadingModels.has(model.id)}
                    className={model.isEnabled ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                  >
                    {loadingModels.has(model.id) ? '连接中...' : (model.isEnabled ? '禁用' : '启用')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditModel(model, 'image')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteModel(model.id, 'image')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
  
  // 渲染视频生成大模型设置
  const renderVideoGenerationModelsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">视频生成大模型配置</h3>
          <p className="text-sm text-gray-600">管理您的视频生成模型和API密钥</p>
        </div>
        <Button
          onClick={() => { setCurrentModelType('video'); setShowAddModel(true); }}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加生成模型
        </Button>
      </div>
      
      <div className="space-y-4">
        {videoGenerationModels.length === 0 ? (
          <Card className="p-8 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无视频生成模型</h3>
            <p className="text-gray-600 mb-4">添加您的第一个视频生成模型开始使用</p>
            <Button
              onClick={() => { setCurrentModelType('video'); setShowAddModel(true); }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加模型
            </Button>
          </Card>
        ) : (
          videoGenerationModels.map((model) => (
            <Card key={model.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{model.name}</h4>
                    <Badge className={`${
                      model.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {model.isEnabled ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>提供商: {model.provider}</div>
                    <div>模型: {model.model}</div>
                    <div>最大令牌: {model.maxTokens}</div>
                    <div>温度: {model.temperature}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toggleModelEnabled(model.id, !model.isEnabled, 'video');
                    }}
                    disabled={loadingModels.has(model.id)}
                    className={model.isEnabled ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                  >
                    {loadingModels.has(model.id) ? '连接中...' : (model.isEnabled ? '禁用' : '启用')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditModel(model, 'video')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteModel(model.id, 'video')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
  
  // 渲染PPT生成大模型设置
  const renderPPTGenerationModelsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">PPT生成大模型配置</h3>
          <p className="text-sm text-gray-600">管理您的PPT生成模型和API密钥</p>
        </div>
        <Button
          onClick={() => { setCurrentModelType('ppt'); setShowAddModel(true); }}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加生成模型
        </Button>
      </div>
      
      <div className="space-y-4">
        {pptGenerationModels.length === 0 ? (
          <Card className="p-8 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无PPT生成模型</h3>
            <p className="text-gray-600 mb-4">添加您的第一个PPT生成模型开始使用</p>
            <Button
              onClick={() => { setCurrentModelType('ppt'); setShowAddModel(true); }}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加模型
            </Button>
          </Card>
        ) : (
          pptGenerationModels.map((model) => (
            <Card key={model.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{model.name}</h4>
                    <Badge className={`${
                      model.isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {model.isEnabled ? '已启用' : '已禁用'}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>提供商: {model.provider}</div>
                    <div>模型: {model.model}</div>
                    <div>最大令牌: {model.maxTokens}</div>
                    <div>温度: {model.temperature}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      toggleModelEnabled(model.id, !model.isEnabled, 'ppt');
                    }}
                    disabled={loadingModels.has(model.id)}
                    className={model.isEnabled ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                  >
                    {loadingModels.has(model.id) ? '连接中...' : (model.isEnabled ? '禁用' : '启用')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditModel(model, 'ppt')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteModel(model.id, 'ppt')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
  
  // 渲染其他设置选项卡（占位符）
  const renderOtherTab = (tabId: string) => (
    <Card className="p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <SettingsIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {settingTabs.find(tab => tab.id === tabId)?.name} 设置
      </h3>
      <p className="text-gray-600 mb-4">
        此功能正在开发中，敬请期待
      </p>
    </Card>
  );
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">设置</h1>
          <p className="text-gray-600">管理您的应用偏好和配置</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：设置导航 */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                {settingTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <div className="font-medium">{tab.name}</div>
                        <div className="text-xs text-gray-500">{tab.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>
          
          {/* 右侧：设置内容 */}
          <div className="lg:col-span-3">
            {activeTab === 'ai-chat-models' ? renderAIChatModelsTab() :
             activeTab === 'audio-analysis-models' ? renderAudioAnalysisModelsTab() :
             activeTab === 'image-generation-models' ? renderImageGenerationModelsTab() :
             activeTab === 'video-generation-models' ? renderVideoGenerationModelsTab() :
             activeTab === 'ppt-generation-models' ? renderPPTGenerationModelsTab() :
             renderOtherTab(activeTab)}
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default Settings;