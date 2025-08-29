// AI API调用工具函数

export interface AIApiRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AIApiResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIModel {
  id: string;
  name: string;
  model: string;
  provider: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  isEnabled: boolean;
  isConnected?: boolean;
}

/**
 * 调用AI API获取回复（模拟实现）
 * @param model AI模型配置
 * @param messages 对话消息历史
 * @param onProgress 流式响应回调函数（可选）
 * @returns AI回复内容
 */
export async function callAIApi(
  model: AIModel,
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  onProgress?: (content: string) => void
): Promise<string> {
  // 基本参数验证
  if (!model.apiKey || !model.isEnabled) {
    throw new Error('模型未配置或未启用');
  }
  
  if (!messages || messages.length === 0) {
    throw new Error('Message field is required.');
  }
  
  // 验证每个消息的格式
  for (const message of messages) {
    if (!message.content || typeof message.content !== 'string') {
      throw new Error('每条消息必须包含有效的content字段');
    }
    if (!message.role || !['user', 'assistant', 'system'].includes(message.role)) {
      throw new Error('每条消息必须包含有效的role字段');
    }
  }
  
  console.log('AI API调用参数 (模拟):', { model: model.model, messagesCount: messages.length });

  // 模拟网络延迟
  const delay = Math.random() * 2000 + 1000; // 1-3秒随机延迟
  await new Promise(resolve => setTimeout(resolve, delay));

  // 模拟随机失败（5%概率）
  if (Math.random() < 0.05) {
    throw new Error('模拟网络错误：连接超时');
  }

  // 获取用户最后一条消息
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const userContent = lastUserMessage?.content || '';

  // 生成模拟回复
  const mockResponses = [
    `我理解您的问题："${userContent.slice(0, 50)}${userContent.length > 50 ? '...' : ''}"。这是一个很有趣的话题，让我来为您详细解答。`,
    `关于您提到的内容，我认为这涉及到多个方面的考虑。首先，我们需要分析问题的核心要素...`,
    `感谢您的提问。基于我的理解，这个问题可以从以下几个角度来思考：1) 技术层面 2) 实践层面 3) 理论基础。`,
    `这是一个很好的问题！让我为您提供一个全面的回答。根据当前的最佳实践和行业标准...`,
    `我注意到您询问的是关于${userContent.includes('技术') ? '技术' : userContent.includes('方法') ? '方法' : '相关'}问题。让我为您详细说明。`
  ];

  let response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  
  // 根据模型类型调整回复风格
  if (model.provider === 'openai') {
    response += ' (OpenAI模型回复)';
  } else if (model.provider === 'anthropic') {
    response += ' (Claude模型回复)';
  } else if (model.provider === 'google') {
    response += ' (Gemini模型回复)';
  }

  // 模拟流式响应
  if (onProgress) {
    const words = response.split('');
    let currentContent = '';
    
    for (let i = 0; i < words.length; i++) {
      currentContent += words[i];
      onProgress(currentContent);
      await new Promise(resolve => setTimeout(resolve, 50)); // 每个字符50ms延迟
    }
  }

  return response;
}

// 流式响应处理函数已移除（纯前端模拟实现中不需要）

// 默认API地址配置已移除（纯前端模拟实现中不需要）