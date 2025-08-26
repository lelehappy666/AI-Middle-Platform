import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Settings, MessageSquare, Trash2, Edit3, User, Bot, Sidebar, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { useAIStore } from '../store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ChatMessage, AIModel } from '../types';
import { callAIApi } from '../utils/aiApi';

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const {
    chatSessions,
    currentSessionId,
    isGenerating,
    settings,
    createChatSession,
    setCurrentSession,
    addMessage,
    updateMessage,
    deleteSession,
    clearSession
  } = useAIStore();
  
  const currentSession = chatSessions.find(session => session.id === currentSessionId);
  const enabledModels = settings.aiChatModels.filter(model => model.isEnabled && model.isConnected);
  
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [showSidebar, setShowSidebar] = useState(false); // 默认在移动端隐藏侧边栏
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);
  
  // 初始化默认模型
  useEffect(() => {
    if (enabledModels.length > 0 && !selectedModel) {
      const defaultModel = enabledModels.find(m => m.id === settings.defaultChatModel) || enabledModels[0];
      setSelectedModel(defaultModel.id);
    }
  }, [enabledModels, selectedModel, settings.defaultChatModel]);
  
  // 创建新对话
  const handleNewChat = () => {
    if (enabledModels.length === 0) {
      alert('请先在设置中配置AI模型');
      return;
    }
    
    const modelId = selectedModel || enabledModels[0].id;
    createChatSession(modelId);
  };
  
  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating || enabledModels.length === 0) return;
    
    const userMessage = inputMessage.trim();
    const modelId = selectedModel || enabledModels[0].id;
    setInputMessage('');
    
    // 如果没有当前会话，自动创建新会话
    let sessionId = currentSessionId;
    
    if (!currentSession) {
      sessionId = createChatSession(modelId);
    }
    
    // 直接使用sessionId发送消息，不依赖异步状态更新
    proceedWithMessage(sessionId, userMessage, modelId);
  };
  
  // 处理消息发送的核心逻辑
  const proceedWithMessage = async (sessionId: string, userMessage: string, modelId: string) => {
    // 添加用户消息
    addMessage(sessionId, {
      role: 'user',
      content: userMessage,
      modelId: modelId
    });
    
    // 添加AI回复占位符
    const assistantMessageId = addMessage(sessionId, {
      role: 'assistant',
      content: '',
      modelId: modelId,
      isLoading: true
    });
    
    // 调用真实的AI API
    try {
      // 获取当前选中的模型配置
      const currentModel = settings.aiChatModels.find(model => model.id === selectedModel);
      
      if (!currentModel) {
        updateMessage(sessionId, assistantMessageId, {
          content: '错误：未找到选中的AI模型配置',
          isLoading: false
        });
        return;
      }
      
      if (!currentModel.isEnabled || !currentModel.isConnected) {
        updateMessage(sessionId, assistantMessageId, {
          content: '错误：选中的AI模型未启用或未连接，请在设置中检查模型配置',
          isLoading: false
        });
        return;
      }
      
      // 获取当前会话的消息历史
      const currentSession = chatSessions.find(session => session.id === sessionId);
      const messageHistory = currentSession?.messages.filter(msg => !msg.isLoading).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })) || [];
      
      // 确保消息历史包含当前用户消息
      if (messageHistory.length === 0 || messageHistory[messageHistory.length - 1].role !== 'user') {
        messageHistory.push({
          role: 'user',
          content: userMessage
        });
      }
      
      // 验证消息历史是否有效
      if (messageHistory.length === 0) {
        console.error('消息历史为空');
        updateMessage(sessionId, assistantMessageId, {
          content: '错误：消息历史为空，无法发送请求',
          isLoading: false
        });
        return;
      }
      
      console.log('发送给AI API的消息历史:', messageHistory);
      
      // 调用AI API，支持流式响应
      const aiResponse = await callAIApi(
        currentModel,
        messageHistory,
        // 流式响应回调
        (partialContent: string) => {
          updateMessage(sessionId, assistantMessageId, {
            content: partialContent,
            isLoading: false
          });
        }
      );
      
      // 如果不是流式响应，更新最终内容
      if (aiResponse) {
        updateMessage(sessionId, assistantMessageId, {
          content: aiResponse,
          isLoading: false
        });
      }
      
    } catch (error: any) {
      console.error('AI API调用失败:', error);
      updateMessage(sessionId, assistantMessageId, {
        content: `错误：${error.message || 'AI API调用失败，请检查网络连接和模型配置'}`,
        isLoading: false
      });
    }
  };
  
  // 处理输入框回车
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 渲染消息
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex mb-3 sm:mb-4 px-2 sm:px-0 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
          <div
            className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-sm sm:text-base ${
              isUser
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            }`}
          >
            {message.isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">AI正在思考...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            )}
          </div>
          <div className={`text-xs text-gray-500 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <Layout>
      <div className="flex h-screen bg-gray-50 relative">
        {/* 遮罩层 - 仅在移动端显示 */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        {/* 侧边栏 */}
        {showSidebar && (
          <div className="fixed md:relative top-0 left-0 h-full w-80 sm:w-72 md:w-80 bg-white border-r border-gray-200 flex flex-col z-50 md:z-auto transform transition-transform duration-300 ease-in-out">
          {/* 侧边栏头部 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">AI 对话</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="p-2 md:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              onClick={handleNewChat}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm sm:text-base py-2 sm:py-3"
              disabled={enabledModels.length === 0}
            >
              <Plus className="w-4 h-4 mr-2" />
              新建对话
            </Button>
          </div>
          
          {/* 模型选择 */}
          {enabledModels.length > 0 && (
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                选择模型
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {enabledModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* 对话列表 */}
          <div className="flex-1 overflow-y-auto">
            {chatSessions.length === 0 ? (
              <div className="p-3 sm:p-4 text-center text-gray-500">
                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm sm:text-base">暂无对话</p>
                <p className="text-xs sm:text-sm">点击上方按钮开始新对话</p>
              </div>
            ) : (
              <div className="p-2">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-2 sm:p-3 mb-2 rounded-lg cursor-pointer transition-colors touch-manipulation ${
                      session.id === currentSessionId
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 active:bg-gray-100'
                    }`}
                    onClick={() => setCurrentSession(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                          {session.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {session.messages.length > 0
                            ? session.messages[session.messages.length - 1].content
                            : '新对话'
                          }
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(session.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearSession(session.id);
                          }}
                          className="p-1.5 sm:p-1 text-gray-400 hover:text-gray-600 min-w-[32px] min-h-[32px] sm:min-w-[24px] sm:min-h-[24px]"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          className="p-1.5 sm:p-1 text-gray-400 hover:text-red-600 min-w-[32px] min-h-[32px] sm:min-w-[24px] sm:min-h-[24px]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col w-full md:ml-0">
        {/* 聊天头部 */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(true)}
                className="p-2 md:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {currentSession?.title || 'AI 对话助手'}
                </h1>
                {currentSession && selectedModel && (
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {enabledModels.find(m => m.id === selectedModel)?.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isGenerating && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  生成中...
                </Badge>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/settings?tab=ai-models')}
                title="AI模型设置"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {enabledModels.length === 0 ? (
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center max-w-md">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">欢迎使用 AI 对话助手</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4">选择一个对话或创建新对话开始聊天</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mx-auto max-w-sm">
                  <p className="text-yellow-800 text-sm sm:text-base font-medium">
                    请先在设置中配置AI模型才能开始对话
                  </p>
                  <button 
                    onClick={() => navigate('/settings?tab=ai-models')}
                    className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                  >
                    前往设置
                  </button>
                </div>
              </div>
            </div>
          ) : !currentSession ? (
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center max-w-md">
                <MessageSquare className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">欢迎使用 AI 对话助手</h3>
                <p className="text-sm sm:text-base text-gray-500 mb-4">选择一个对话或创建新对话开始聊天</p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {currentSession.messages.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base text-gray-500">开始您的对话吧！</p>
                </div>
              ) : (
                currentSession.messages.map(renderMessage)
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* 输入区域 */}
        <div className="bg-white border-t border-gray-200 p-3 sm:p-4 safe-area-inset-bottom">
          <div className="max-w-4xl mx-auto">
            {enabledModels.length > 0 && (
              <div className="flex items-end space-x-2 sm:space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入消息..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    rows={1}
                    style={{
                      minHeight: '44px',
                      maxHeight: '120px',
                      height: 'auto'
                    }}
                    disabled={isGenerating}
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isGenerating}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 sm:p-3 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default AIChat;