import { create } from 'zustand';

interface SearchState {
  query: string;
  isSearching: boolean;
  searchHistory: string[];
  suggestions: string[];
}

interface SearchActions {
  setQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  addToHistory: (query: string) => void;
  clearHistory: () => void;
  removeFromHistory: (query: string) => void;
  setSuggestions: (suggestions: string[]) => void;
  clearSuggestions: () => void;
}

interface SearchStore extends SearchState, SearchActions {}

const MAX_HISTORY_ITEMS = 10;

export const useSearchStore = create<SearchStore>((set, get) => ({
  // 初始状态
  query: '',
  isSearching: false,
  searchHistory: [],
  suggestions: [],

  // Actions
  setQuery: (query) => {
    set({ query });
    
    // 如果查询为空，清除建议
    if (!query.trim()) {
      get().clearSuggestions();
    }
  },

  setIsSearching: (isSearching) => set({ isSearching }),

  addToHistory: (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const { searchHistory } = get();
    
    // 移除重复项
    const filteredHistory = searchHistory.filter(item => item !== trimmedQuery);
    
    // 添加到开头
    const newHistory = [trimmedQuery, ...filteredHistory];
    
    // 限制历史记录数量
    const limitedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
    
    set({ searchHistory: limitedHistory });
  },

  clearHistory: () => set({ searchHistory: [] }),

  removeFromHistory: (query) => {
    const { searchHistory } = get();
    const filteredHistory = searchHistory.filter(item => item !== query);
    set({ searchHistory: filteredHistory });
  },

  setSuggestions: (suggestions) => set({ suggestions }),

  clearSuggestions: () => set({ suggestions: [] })
}));

// 选择器函数
export const selectQuery = (state: SearchStore) => state.query;
export const selectIsSearching = (state: SearchStore) => state.isSearching;
export const selectSearchHistory = (state: SearchStore) => state.searchHistory;
export const selectSuggestions = (state: SearchStore) => state.suggestions;