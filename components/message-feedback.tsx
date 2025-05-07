import { memo } from "react";
import { AIFeedbackResponse, Feedback } from "../types/chat";
import { DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { DialogHeader } from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { getUserLanguage } from "../lib/fe/utils/language";

// 피드백 컴포넌트
const FeedbackItem = memo(({ feedback }: { feedback: Feedback }) => {
  if (feedback.count === 0) return null;
  
  return (
    <div className="mt-2 text-xs text-white/80">
      <div className="font-semibold">{feedback.issue}</div>
      {feedback.details.map((detail, index) => (
        <div key={index} className="ml-2 mt-1">
          • {detail.description}
        </div>
      ))}
    </div>
  );
});
FeedbackItem.displayName = 'FeedbackItem';

// 평가 점수 컴포넌트
const EvaluationScore = memo(({ score }: { score: number }) => {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10">
      <span className="text-xs text-white/80">점수:</span>
      <span className="text-sm font-semibold text-white">{score.toFixed(1)}</span>
    </div>
  );
});
EvaluationScore.displayName = 'EvaluationScore';

interface MessageFeedbackProps {
  response?: AIFeedbackResponse;
}

export const MessageFeedback = memo(({ response }: MessageFeedbackProps) => {
  if (!response) return null;

  const getFeedbackMessage = (feedback: { en: string; [key: string]: string }) => {
    const userLang = getUserLanguage();
    return feedback[userLang] || feedback.en;
  };

  return (
    <DialogContent className="absolute top-[60px] right-4 w-[800px] bg-black/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg max-h-[600px]">
      <DialogHeader className="px-4 py-3 border-b border-white/80">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-base text-white flex items-center gap-2">
            <img src="/images/icon.png" alt="icon" className="w-[35px] inline-block" />
            Chirpi's feedBack!
          </DialogTitle>
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))}
            className="text-xs text-white/60 hover:text-white"
          >
            Close
          </button>
        </div>
      </DialogHeader>
      <ScrollArea className="h-[600px]">
        <div className="p-4">
          <div className="mb-4">
            <div className="text-xs text-white/60 mb-1">Your message:</div>
            <div className="text-sm text-white bg-white/10 p-3 rounded-lg">{response.userMessage}</div>
          </div>
          <div className="space-y-4">
            <EvaluationScore score={response.total_score} />
            <div className="text-sm text-white/80">
              {getFeedbackMessage(response.total_feedback)}
            </div>
            <div className="space-y-2">
              <FeedbackItem feedback={response.feedback.grammar_accuracy} />
              <FeedbackItem feedback={response.feedback.sentence_naturalness} />
              <FeedbackItem feedback={response.feedback.vocabulary_naturalness} />
              <FeedbackItem feedback={response.feedback.comprehension} />
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}); 