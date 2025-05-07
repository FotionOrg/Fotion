import { Trophy } from "lucide-react";
import { cn } from "../lib/fe/utils/cn";
import { AIResponse } from "../types/chat";

interface ChallengeTaskProps {
  isOpen?: boolean;
  containerWidth: number;
  challenge?: AIResponse;
}

export function ChallengeTask({ isOpen, containerWidth, challenge }: ChallengeTaskProps) {
  const panelWidth = containerWidth - 200;
  const leftPosition = `calc(50% - ${panelWidth/2}px)`;

  if (!challenge) return null;
  
  return (
    <div 
      className={cn(
        "absolute transition-all duration-300 ease-in-out transform",
        isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
      style={{ 
        width: `${panelWidth}px`,
        left: leftPosition,
        top: "10px"
      }}
    >
      <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-4 w-4 text-yellow-400" />
          <h2 className="text-sm font-medium text-white">Challenge task</h2>
        </div>
        <p className="text-sm text-white/80 pl-6">
          {challenge.total_feedback.ko}
        </p>
      </div>
    </div>
  );
} 