import React, { useState, useRef } from 'react';
import { Upload, Play, Pause, Download, FileAudio, Trash2, Clock, CheckCircle, AlertCircle, Mic, Volume2 } from 'lucide-react';
import { Layout } from '../components/layout';
import { useAIStore } from '../store';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AudioAnalysisTask, AudioAnalysisResult } from '../types';

const AudioAnalysis: React.FC = () => {
  const {
    audioTasks,
    addAudioTask,
    updateAudioTask,
    deleteAudioTask
  } = useAIStore();
  
  const [dragOver, setDragOver] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // 支持的音频格式
  const supportedFormats = ['mp3', 'wav', 'aac', 'm4a', 'ogg', 'flac'];
  
  // 处理文件上传
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      // 检查文件类型
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !supportedFormats.includes(fileExtension)) {
        alert(`不支持的文件格式: ${fileExtension}。支持的格式: ${supportedFormats.join(', ')}`);
        return;
      }
      
      // 检查文件大小 (限制100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert('文件大小不能超过100MB');
        return;
      }
      
      const taskId = addAudioTask(file);
      
      // 模拟分析过程
      simulateAnalysis(taskId);
    });
  };
  
  // 模拟音频分析过程
  const simulateAnalysis = async (taskId: string) => {
    // 开始分析
    updateAudioTask(taskId, {
      status: 'processing',
      progress: 0,
      updatedAt: Date.now()
    });
    
    // 模拟进度更新
    for (let progress = 10; progress <= 90; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      updateAudioTask(taskId, {
        progress,
        updatedAt: Date.now()
      });
    }
    
    // 完成分析
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResult: AudioAnalysisResult = {
      id: taskId,
      fileName: audioTasks.find(t => t.id === taskId)?.fileName || '',
      fileSize: audioTasks.find(t => t.id === taskId)?.fileSize || 0,
      transcript: '这是一段模拟的语音转文字结果。在实际项目中，这里会调用真实的语音识别API来获取准确的转录内容。音频质量良好，识别准确率较高。',
      summary: '音频内容主要讨论了AI技术的发展趋势和应用场景，包括自然语言处理、计算机视觉等领域的最新进展。',
      keyPoints: ['AI技术快速发展', '自然语言处理应用广泛', '计算机视觉前景广阔'],
      keywords: ['AI技术', '自然语言处理', '计算机视觉', '发展趋势', '应用场景'],
      sentiment: 'positive',
      confidence: 0.92,
      duration: Math.floor(Math.random() * 300) + 60, // 60-360秒
      language: 'zh-CN',
      speakerCount: Math.floor(Math.random() * 3) + 1,
      topics: [
        { name: 'AI技术发展', confidence: 0.95 },
        { name: '应用场景分析', confidence: 0.88 },
        { name: '未来趋势预测', confidence: 0.82 }
      ],
      createdAt: Date.now()
    };
    
    updateAudioTask(taskId, {
      status: 'completed',
      progress: 100,
      result: mockResult,
      updatedAt: Date.now()
    });
  };
  
  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };
  
  // 播放/暂停音频
  const toggleAudioPlay = (taskId: string, fileUrl: string) => {
    if (playingAudio === taskId) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = fileUrl;
        audioRef.current.play();
        setPlayingAudio(taskId);
      }
    }
  };
  
  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // 格式化时长
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return null;
    }
  };
  
  // 获取情感分析颜色
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };
  
  const selectedTaskData = selectedTask ? audioTasks.find(t => t.id === selectedTask) : null;
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">录音文件分析</h1>
          <p className="text-gray-600">上传音频文件，获取智能分析结果，包括语音转文字、内容摘要、关键词提取等</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：上传区域和任务列表 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 文件上传区域 */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">上传音频文件</h2>
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FileAudio className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    拖拽文件到此处或点击上传
                  </h3>
                  
                  <p className="text-gray-500 mb-4">
                    支持格式：{supportedFormats.join(', ')}
                  </p>
                  
                  <p className="text-sm text-gray-400 mb-6">
                    最大文件大小：100MB
                  </p>
                  
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    选择文件
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={supportedFormats.map(f => `.${f}`).join(',')}
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>
            </Card>
            
            {/* 任务列表 */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">分析任务</h2>
                <Badge variant="secondary">{audioTasks.length} 个任务</Badge>
              </div>
              
              {audioTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Mic className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">暂无分析任务</p>
                  <p className="text-sm text-gray-400">上传音频文件开始分析</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {audioTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTask === task.id
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTask(task.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <FileAudio className="w-8 h-8 text-blue-500" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {task.fileName}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{formatFileSize(task.fileSize)}</span>
                              {task.result?.duration && (
                                <span>{formatDuration(task.result.duration)}</span>
                              )}
                              <span>{new Date(task.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* 播放按钮 */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAudioPlay(task.id, task.fileUrl);
                            }}
                            className="p-2"
                          >
                            {playingAudio === task.id ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          
                          {/* 状态 */}
                          <Badge className={getStatusColor(task.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(task.status)}
                              <span className="capitalize">
                                {task.status === 'pending' && '等待中'}
                                {task.status === 'processing' && '分析中'}
                                {task.status === 'completed' && '已完成'}
                                {task.status === 'failed' && '失败'}
                              </span>
                            </div>
                          </Badge>
                          
                          {/* 删除按钮 */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAudioTask(task.id);
                              if (selectedTask === task.id) {
                                setSelectedTask(null);
                              }
                            }}
                            className="p-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* 进度条 */}
                      {task.status === 'processing' && task.progress !== undefined && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>分析进度</span>
                            <span>{task.progress}%</span>
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
                  ))}
                </div>
              )}
            </Card>
          </div>
          
          {/* 右侧：分析结果详情 */}
          <div className="space-y-6">
            {selectedTaskData ? (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">分析结果</h2>
                
                {selectedTaskData.status === 'completed' && selectedTaskData.result ? (
                  <div className="space-y-6">
                    {/* 基本信息 */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">基本信息</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">时长：</span>
                          <span>{formatDuration(selectedTaskData.result.duration)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">语言：</span>
                          <span>{selectedTaskData.result.language}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">说话人数：</span>
                          <span>{selectedTaskData.result.speakerCount} 人</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">置信度：</span>
                          <span>{(selectedTaskData.result.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">情感倾向：</span>
                          <span className={getSentimentColor(selectedTaskData.result.sentiment)}>
                            {selectedTaskData.result.sentiment === 'positive' && '积极'}
                            {selectedTaskData.result.sentiment === 'negative' && '消极'}
                            {selectedTaskData.result.sentiment === 'neutral' && '中性'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 转录文本 */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">转录文本</h3>
                      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                        {selectedTaskData.result.transcript}
                      </div>
                    </div>
                    
                    {/* 内容摘要 */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">内容摘要</h3>
                      <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                        {selectedTaskData.result.summary}
                      </div>
                    </div>
                    
                    {/* 关键词 */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">关键词</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTaskData.result.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* 主题分析 */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">主题分析</h3>
                      <div className="space-y-2">
                        {selectedTaskData.result.topics.map((topic, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{topic.name}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${topic.confidence * 100}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-10">
                                {(topic.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="pt-4 border-t border-gray-200">
                      <Button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                        onClick={() => {
                          // 导出分析结果
                          const data = JSON.stringify(selectedTaskData.result, null, 2);
                          const blob = new Blob([data], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${selectedTaskData.fileName}_analysis.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        导出分析结果
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {selectedTaskData.status === 'processing' ? (
                      <div>
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">正在分析音频文件...</p>
                        {selectedTaskData.progress !== undefined && (
                          <p className="text-sm text-gray-500 mt-2">
                            进度：{selectedTaskData.progress}%
                          </p>
                        )}
                      </div>
                    ) : selectedTaskData.status === 'pending' ? (
                      <div>
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-600">等待分析...</p>
                      </div>
                    ) : selectedTaskData.status === 'failed' ? (
                      <div>
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                        <p className="text-red-600">分析失败</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {selectedTaskData.error || '未知错误'}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </Card>
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <Volume2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">选择一个任务查看分析结果</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* 隐藏的音频播放器 */}
      <audio
        ref={audioRef}
        onEnded={() => setPlayingAudio(null)}
        onError={() => setPlayingAudio(null)}
      />
    </div>
    </Layout>
  );
};

export default AudioAnalysis;