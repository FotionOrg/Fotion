import { Send } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <div className="absolute bottom-4 left-4 right-4">
      <div className="flex gap-2 bg-black/50 backdrop-blur-sm rounded-xl p-2 shadow-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="메시지를 입력하세요..."
          disabled={disabled}
          className="flex-1 bg-white/10 text-white placeholder:text-white/60 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
        <Button
          onClick={handleSend}
          disabled={disabled}
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 