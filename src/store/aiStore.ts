import { create } from 'zustand';
import { 
  AIState, 
  AIModel, 
  ChatSession, 
  ChatMessage, 
  AudioAnalysisTask, 
  AudioAnalysisResult,
  GenerationTask,
  GenerationResult,
  AISettings,
  GenerationType,
  GenerationParams,
  AIProvider
} from '../types';

interface AIStore extends AIState {
  // 对话相关方法
  createChatSession: (modelId: string, title?: string) => string;
  setCurrentSession: (sessionId: string) => void;
  addMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  clearSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  
  // 录音分析相关方法
  addAudioTask: (file: File) => string;
  updateAudioTask: (taskId: string, updates: Partial<AudioAnalysisTask>) => void;
  completeAudioAnalysis: (taskId: string, result: AudioAnalysisResult) => void;
  deleteAudioTask: (taskId: string) => void;
  
  // AI生成相关方法
  createGenerationTask: (type: GenerationType, params: GenerationParams) => string;
  updateGenerationTask: (taskId: string, updates: Partial<GenerationTask>) => void;
  completeGeneration: (taskId: string, result: GenerationResult) => void;
  deleteGenerationTask: (taskId: string) => void;
  
  // 设置相关方法
  addAIModel: (model: Omit<AIModel, 'id'>, modelType: 'aiChat' | 'audioAnalysis' | 'imageGeneration' | 'videoGeneration' | 'pptGeneration') => void;
  updateAIModel: (modelId: string, updates: Partial<AIModel>, modelType: 'aiChat' | 'audioAnalysis' | 'imageGeneration' | 'videoGeneration' | 'pptGeneration') => void;
  deleteAIModel: (modelId: string, modelType: 'aiChat' | 'audioAnalysis' | 'imageGeneration' | 'videoGeneration' | 'pptGeneration') => void;
  setDefaultModel: (type: 'chat' | 'image' | 'video', modelId: string) => void;
  updateSettings: (settings: Partial<AISettings>) => void;
  
  // 通用方法
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setGenerating: (generating: boolean) => void;
}

// 生成唯一ID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 默认AI设置
const defaultSettings: AISettings = {
  // AI对话模型
  aiChatModels: [
    // 硅基流动 DeepSeek 系列
    {
      id: 'deepseek-r1-qwen3-8b',
      name: 'DeepSeek-R1-0528-Qwen3-8B',
      model: 'deepseek-ai/DeepSeek-R1-0528-Qwen3-8B',
      provider: '硅基流动',
      apiKey: '', // 请在设置中配置您的API密钥
      maxTokens: 8192,
      temperature: 0.7,
      isEnabled: false,
      isConnected: false,
      baseUrl: 'https://api.siliconflow.cn/v1',
      description: '硅基流动免费的DeepSeek-R1模型，基于Qwen3-8B架构',
      createdAt: Date.now()
    }
  ],
  // 其他类型模型（暂时为空）
  audioAnalysisModels: [],
  imageGenerationModels: [],
  videoGenerationModels: [],
  pptGenerationModels: [],
  autoSave: true,
  maxChatHistory: 100
};

export const useAIStore = create<AIStore>((set, get) => ({
  // 初始状态
  chatSessions: [],
  currentSessionId: undefined,
  isGenerating: false,
  audioTasks: [],
  analysisResults: [],
  generationTasks: [],
  generationResults: [],
  settings: defaultSettings,
  isLoading: false,
  error: undefined,
  
  // 对话相关方法
  createChatSession: (modelId: string, title?: string) => {
    const sessionId = generateId();
    const newSession: ChatSession = {
      id: sessionId,
      title: title || '新对话',
      messages: [],
      modelId,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    set(state => ({
      chatSessions: [...state.chatSessions, newSession],
      currentSessionId: sessionId
    }));
    
    return sessionId;
  },
  
  setCurrentSession: (sessionId: string) => {
    set({ currentSessionId: sessionId });
  },
  
  addMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const messageId = generateId();
    const newMessage: ChatMessage = {
      ...message,
      id: messageId,
      timestamp: Date.now()
    };
    
    set(state => ({
      chatSessions: state.chatSessions.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              messages: [...session.messages, newMessage],
              updatedAt: Date.now()
            }
          : session
      )
    }));
    
    return messageId;
  },
  
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => {
    set(state => ({
      chatSessions: state.chatSessions.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              messages: session.messages.map(msg => 
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
              updatedAt: Date.now()
            }
          : session
      )
    }));
  },
  
  deleteMessage: (sessionId: string, messageId: string) => {
    set(state => ({
      chatSessions: state.chatSessions.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              messages: session.messages.filter(msg => msg.id !== messageId),
              updatedAt: Date.now()
            }
          : session
      )
    }));
  },
  
  clearSession: (sessionId: string) => {
    set(state => ({
      chatSessions: state.chatSessions.map(session => 
        session.id === sessionId 
          ? {
              ...session,
              messages: [],
              updatedAt: Date.now()
            }
          : session
      )
    }));
  },
  
  deleteSession: (sessionId: string) => {
    set(state => {
      const newSessions = state.chatSessions.filter(session => session.id !== sessionId);
      const newCurrentSessionId = state.currentSessionId === sessionId 
        ? (newSessions.length > 0 ? newSessions[0].id : undefined)
        : state.currentSessionId;
      
      return {
        chatSessions: newSessions,
        currentSessionId: newCurrentSessionId
      };
    });
  },
  
  // 录音分析相关方法
  addAudioTask: (file: File) => {
    const taskId = generateId();
    const newTask: AudioAnalysisTask = {
      id: taskId,
      file,
      fileName: file.name,
      fileSize: file.size,
      status: 'pending',
      progress: 0,
      createdAt: Date.now()
    };
    
    set(state => ({
      audioTasks: [...state.audioTasks, newTask]
    }));
    
    return taskId;
  },
  
  updateAudioTask: (taskId: string, updates: Partial<AudioAnalysisTask>) => {
    set(state => ({
      audioTasks: state.audioTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));
  },
  
  completeAudioAnalysis: (taskId: string, result: AudioAnalysisResult) => {
    set(state => ({
      audioTasks: state.audioTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const, progress: 100, result }
          : task
      ),
      analysisResults: [...state.analysisResults, result]
    }));
  },
  
  deleteAudioTask: (taskId: string) => {
    set(state => ({
      audioTasks: state.audioTasks.filter(task => task.id !== taskId)
    }));
  },
  
  // AI生成相关方法
  createGenerationTask: (type: GenerationType, params: GenerationParams) => {
    const taskId = generateId();
    const newTask: GenerationTask = {
      id: taskId,
      type,
      params,
      status: 'pending',
      progress: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    set(state => ({
      generationTasks: [...state.generationTasks, newTask]
    }));
    
    return taskId;
  },
  
  updateGenerationTask: (taskId: string, updates: Partial<GenerationTask>) => {
    set(state => ({
      generationTasks: state.generationTasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }));
  },
  
  completeGeneration: (taskId: string, result: GenerationResult) => {
    set(state => ({
      generationTasks: state.generationTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const, progress: 100, result }
          : task
      ),
      generationResults: [...state.generationResults, result]
    }));
  },
  
  deleteGenerationTask: (taskId: string) => {
    set(state => ({
      generationTasks: state.generationTasks.filter(task => task.id !== taskId)
    }));
  },
  
  // 设置相关方法
  addAIModel: (model: Omit<AIModel, 'id' | 'createdAt'>, modelType: 'aiChat' | 'audioAnalysis' | 'imageGeneration' | 'videoGeneration' | 'pptGeneration') => {
    const newModel: AIModel = {
      ...model,
      id: generateId(),
      createdAt: Date.now()
    };
    
    const modelArrayKey = `${modelType}Models` as keyof AISettings;
    
    set(state => ({
      settings: {
        ...state.settings,
        [modelArrayKey]: [...(state.settings[modelArrayKey] as AIModel[]), newModel]
      }
    }));
  },

  updateAIModel: (modelId: string, updates: Partial<AIModel>, modelType: 'aiChat' | 'audioAnalysis' | 'imageGeneration' | 'videoGeneration' | 'pptGeneration') => {
    const modelArrayKey = `${modelType}Models` as keyof AISettings;
    
    set(state => ({
      settings: {
        ...state.settings,
        [modelArrayKey]: (state.settings[modelArrayKey] as AIModel[]).map(model => 
          model.id === modelId ? { ...model, ...updates } : model
        )
      }
    }));
  },

  deleteAIModel: (modelId: string, modelType: 'aiChat' | 'audioAnalysis' | 'imageGeneration' | 'videoGeneration' | 'pptGeneration') => {
    const modelArrayKey = `${modelType}Models` as keyof AISettings;
    
    set(state => ({
      settings: {
        ...state.settings,
        [modelArrayKey]: (state.settings[modelArrayKey] as AIModel[]).filter(model => model.id !== modelId)
      }
    }));
  },
  
  setDefaultModel: (type: 'chat' | 'image' | 'video' | 'generation', modelId: string) => {
    const settingKey = type === 'generation' ? 'defaultGenerationModel' : `default${type.charAt(0).toUpperCase() + type.slice(1)}Model`;
    set(state => ({
      settings: {
        ...state.settings,
        [settingKey]: modelId
      }
    }));
  },
  
  updateSettings: (settings: Partial<AISettings>) => {
    set(state => ({
      settings: {
        ...state.settings,
        ...settings
      }
    }));
  },
  
  // 通用方法
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  setError: (error: string | null) => {
    set({ error: error || undefined });
  },
  
  setGenerating: (generating: boolean) => {
    set({ isGenerating: generating });
  }
}));

// 选择器函数
export const selectChatSessions = (state: AIStore) => state.chatSessions;
export const selectCurrentSession = (state: AIStore) => 
  state.chatSessions.find(session => session.id === state.currentSessionId);
export const selectIsGenerating = (state: AIStore) => state.isGenerating;
export const selectAudioTasks = (state: AIStore) => state.audioTasks;
export const selectAnalysisResults = (state: AIStore) => state.analysisResults;
export const selectGenerationTasks = (state: AIStore) => state.generationTasks;
export const selectGenerationResults = (state: AIStore) => state.generationResults;
export const selectAISettings = (state: AIStore) => state.settings;

// 分类模型选择器
export const selectAIChatModels = (state: AIStore) => state.settings.aiChatModels;
export const selectAudioAnalysisModels = (state: AIStore) => state.settings.audioAnalysisModels;
export const selectImageGenerationModels = (state: AIStore) => state.settings.imageGenerationModels;
export const selectVideoGenerationModels = (state: AIStore) => state.settings.videoGenerationModels;
export const selectPPTGenerationModels = (state: AIStore) => state.settings.pptGenerationModels;

// 启用模型选择器
export const selectEnabledAIChatModels = (state: AIStore) => 
  state.settings.aiChatModels.filter(model => model.isEnabled && model.isConnected);
export const selectEnabledAudioAnalysisModels = (state: AIStore) => 
  state.settings.audioAnalysisModels.filter(model => model.isEnabled && model.isConnected);
export const selectEnabledImageGenerationModels = (state: AIStore) => 
  state.settings.imageGenerationModels.filter(model => model.isEnabled && model.isConnected);
export const selectEnabledVideoGenerationModels = (state: AIStore) => 
  state.settings.videoGenerationModels.filter(model => model.isEnabled && model.isConnected);
export const selectEnabledPPTGenerationModels = (state: AIStore) => 
  state.settings.pptGenerationModels.filter(model => model.isEnabled && model.isConnected);

// 兼容性选择器（保持向后兼容）
export const selectAIModels = (state: AIStore) => state.settings.aiChatModels;
export const selectEnabledModels = (state: AIStore) => 
  state.settings.aiChatModels.filter(model => model.isEnabled && model.isConnected);

export const selectAILoading = (state: AIStore) => state.isLoading;
export const selectAIError = (state: AIStore) => state.error;