// 媒体存储状态管理
export {
  useMediaStore,
  selectFiles,
  selectSelectedFiles,
  selectSelectedFile,
  selectLoading,
  selectError,
  selectFilter,
  selectSort,
  selectViewMode
} from './mediaStore';

// 搜索状态管理
export {
  useSearchStore,
  selectQuery,
  selectIsSearching,
  selectSearchHistory,
  selectSuggestions
} from './searchStore';

// AI状态管理
export {
  useAIStore,
  selectChatSessions,
  selectCurrentSession,
  selectIsGenerating,
  selectAudioTasks,
  selectAnalysisResults,
  selectGenerationTasks,
  selectGenerationResults,
  selectAISettings,
  selectAIModels,
  selectEnabledModels,
  selectAILoading,
  selectAIError,
  // 分类模型选择器
  selectAIChatModels,
  selectAudioAnalysisModels,
  selectImageGenerationModels,
  selectVideoGenerationModels,
  selectPPTGenerationModels,
  // 启用模型选择器
  selectEnabledAIChatModels,
  selectEnabledAudioAnalysisModels,
  selectEnabledImageGenerationModels,
  selectEnabledVideoGenerationModels,
  selectEnabledPPTGenerationModels
} from './aiStore';