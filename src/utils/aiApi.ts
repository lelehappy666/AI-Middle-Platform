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
 * 调用AI API获取回复
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
  if (!model.apiKey || !model.isEnabled || !model.isConnected) {
    throw new Error('模型未配置或未启用');
  }
  
  // 验证messages参数
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
  
  console.log('AI API调用参数:', { model: model.model, messagesCount: messages.length, messages });

  const baseUrl = model.baseUrl || getDefaultBaseUrl(model.provider);
  const endpoint = `${baseUrl}/chat/completions`;

  const requestBody: AIApiRequest = {
    model: model.model,
    messages: messages,
    max_tokens: model.maxTokens || 2048,
    temperature: model.temperature || 0.7,
    stream: !!onProgress // 如果有进度回调则启用流式响应
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${model.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }
      
      throw new Error(errorMessage);
    }

    // 处理流式响应
    if (onProgress && requestBody.stream) {
      return await handleStreamResponse(response, onProgress);
    }
    
    // 处理普通响应
    const data: AIApiResponse = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('API返回数据格式错误');
    }

    return data.choices[0].message.content || '';
    
  } catch (error: any) {
    console.error('AI API调用失败:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }
    
    throw new Error(error.message || 'AI API调用失败，请检查网络连接和配置');
  }
}

/**
 * 处理流式响应
 */
async function handleStreamResponse(
  response: Response,
  onProgress: (content: string) => void
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('无法读取流式响应');
  }

  const decoder = new TextDecoder();
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') {
            return fullContent;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              fullContent += content;
              onProgress(fullContent);
            }
          } catch (e) {
            // 忽略解析错误的数据块
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullContent;
}

/**
 * 获取默认API地址
 */
function getDefaultBaseUrl(provider: string): string {
  switch (provider) {
    case 'openai':
      return 'https://api.openai.com/v1';
    case 'anthropic':
      return 'https://api.anthropic.com/v1';
    case 'google':
      return 'https://generativelanguage.googleapis.com/v1';
    case 'deepseek':
      return 'https://api.deepseek.com/v1';
    case '硅基流动':
      return 'https://api.siliconflow.cn/v1';
    default:
      return 'https://api.openai.com/v1';
  }
}