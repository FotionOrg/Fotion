import { createContext, useContext, useState, ReactNode } from 'react';
import { useWebSocket } from '../app/hooks/useWebSocket';
import {  ChallengeTask, ChatMessage } from '../types/chat';

export interface WebSocketContextType {
  sendMessage: (content: string) => void;
  isConnected: boolean;
  error: string | null;
  messages: ChatMessage[];
  challengeTasks: ChallengeTask[];
  loadMoreMessages: (lastMessageId?: string) => Promise<boolean>;
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  mode: 'full' | 'trial';
}

export function WebSocketProvider({ children, mode }: WebSocketProviderProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [challengeTasks, setChallengeTasks] = useState<ChallengeTask[]>([]);
  const [isLoadingMessages] = useState(false);
  const [hasMoreMessages] = useState(true);

  const { sendMessage, isConnected, error } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080',
    onMessage: (message) => {
      setMessages(prev => [message, ...prev]);
    },
    onChallengeTask: (challengeTask) => {
      if (mode === 'full') {
        setChallengeTasks(prev => {
          const exists = prev.find(a => a.id === challengeTask.id);
          if (exists) return prev;
          return [...prev, challengeTask];
        });
      }
    },
  });

  const loadMoreMessages = async (_lastMessageId?: string) => {
    // 임시로 API 호출 비활성화
    return false;
    
    /* 
    if (isLoadingMessages || !hasMoreMessages) return false;
    
    try {
      setIsLoadingMessages(true);
      
      // API 호출
      const response = await fetch(`/api/messages?${new URLSearchParams({
        lastMessageId: lastMessageId || '',
        limit: String(PAGE_SIZE),
        mode,
      })}`);
      
      if (!response.ok) throw new Error('Failed to load messages');
      
      const data: ChatMessage[] = await response.json();
      
      setMessages(prev => {
        // 중복 메시지 제거
        const newMessages = data.filter(
          newMsg => !prev.some(existingMsg => existingMsg.id === newMsg.id)
        );
        return [...prev, ...newMessages];
      });
      
      // 더 로드할 메시지가 있는지 확인
      setHasMoreMessages(data.length === PAGE_SIZE);
      
      return data.length > 0;
    } catch (err) {
      console.error('Failed to load messages:', err);
      return false;
    } finally {
      setIsLoadingMessages(false);
    }
    */
  };

  const value = {
    sendMessage,
    isConnected,
    error,
    messages,
    challengeTasks,
    loadMoreMessages,
    isLoadingMessages,
    hasMoreMessages,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
} 