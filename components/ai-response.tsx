import { ScrollArea } from "./ui/scroll-area";

interface AIResponseProps {
  response?: string;
  persona?: string;
  emotion?: string;
}

export function AIResponse({ response, persona }: AIResponseProps) {
  const mockData = { 
    response: "안녕하세요! 저는 영어 학습을 도와주는 AI 어시스턴트입니다. 함께 영어를 배워볼까요?",
    persona: "Aru",
    emotion: "speaks with concern"
  };

  return (
    <div className="absolute bottom-[80px] left-4 right-4">
      <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 text-white shadow-lg">
        {/* Persona Title */}
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg font-bold text-white">
            {persona || mockData.persona}
          </span>
          <span className="text-sm text-white/60 italic">
            {mockData.emotion}
          </span>
          <div className="ml-2 h-px flex-1 bg-white/20" />
        </div>

        <ScrollArea className="h-[100px]">
          <div className="text-base leading-relaxed">
            {response || mockData.response}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 