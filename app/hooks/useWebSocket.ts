import { useEffect, useRef, useState } from 'react';
import { ChatMessage, WebSocketMessage } from '../../types/chat';

interface UseWebSocketProps {
  url: string;
  onMessage?: (message: ChatMessage) => void;
  onChallengeTask?: (challengeTask: any) => void;
}

export function useWebSocket({ url, onMessage, onChallengeTask }: UseWebSocketProps) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const data: WebSocketMessage = JSON.parse(event.data);
        
        switch (data.type) {
          case 'message':
            onMessage?.(data.payload);
            break;
          case 'challenge-task':
            onChallengeTask?.(data.payload);
            break;
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (err) {
        console.error('Failed to parse message:', err);
      }
    };

    socket.onerror = (event) => {
      setError('WebSocket error occurred');
      console.error('WebSocket error:', event);
    };

    socket.onclose = () => {
      setIsConnected(false);
      setError('WebSocket connection closed');
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [url, onMessage, onChallengeTask]);

  const sendMessage = (content: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'message',
        payload: {
          content,
          timestamp: new Date().toISOString(),
        },
      }));
    }
  };

  return {
    isConnected,
    error,
    sendMessage,
  };
} 