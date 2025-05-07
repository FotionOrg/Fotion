"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@radix-ui/react-alert-dialog";
import { AlertDialogFooter, AlertDialogHeader } from "./ui/alert-dialog";
import { MessageSquare, Trophy } from "lucide-react";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import { ChatContent } from "./chat-content";
import { ChallengeTask } from "./challenge-task";
import { MessageFeedback } from "./message-feedback";
import { WebSocketProvider, useWebSocketContext } from "../contexts/WebSocketContext";
import { AIResponse } from "./ai-response";
import { ChatInput } from "./chat-input";
import { mockChallengeData } from "../lib/fe/mock/challenge-data";
import { AIResponse as AIResponseType, AIFeedbackResponse } from "../types/chat";

interface ChatContainerProps {
    persona: string;
    mode: "full" | "trial";    
}

function ChatContainerContent({persona, mode}: ChatContainerProps) {
    const STORAGE_KEY = "trial_message_count";
    const maxTrialCount = Number(process.env.NEXT_PUBLIC_MAX_TRIAL_COUNT) || 5;
    const [messageCount, setMessageCount] = useState<number>(0);
    const { challengeTasks, sendMessage, messages } = useWebSocketContext();
    
    const [isTrialEnded, setIsTrialEnded] = useState<boolean>(() => {
        if (mode === "trial") {
            const storedCount = localStorage.getItem(STORAGE_KEY);
            if (storedCount) {
                return Number(storedCount) >= maxTrialCount;
            }
        }
        return false;
    });

    const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
    const [selectedFeedback, setSelectedFeedback] = useState<AIFeedbackResponse | null>(null);

    useEffect(() => {
        const storedCount = localStorage.getItem(STORAGE_KEY);
        if (storedCount) {
            setMessageCount(Number(storedCount));
        }
    }, []);

    useEffect(() => {
        if (mode === "trial" && messageCount >= maxTrialCount) {
            setIsTrialEnded(true);
        }  
    }, [messageCount, mode, maxTrialCount]);

    const handleSendMessage = (content: string) => {
        sendMessage(content);
        if (mode === "trial") {
            setMessageCount(prev => {
                const newCount = prev + 1;
                localStorage.setItem(STORAGE_KEY, String(newCount));
                return newCount;
            });
        }
    };

    // 가장 최근 AI 응답 가져오기
    const lastAIResponse = messages
        .filter(m => m.sender === 'assistant')
        .slice(-1)[0]?.content as AIResponseType || "";

    return (
        <div className="relative" style={{ width: "1000px", height: "auto" }}>
            <img src={`/images/${persona}.png`} alt={persona} style={{ width: "100%", height: "auto" }} />
            
            {/* 우측 상단 버튼 그룹 */}
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full bg-white/80 hover:bg-white/90 relative"
                    onClick={() => setIsAchievementsOpen(prev => !prev)}
                >
                    <Trophy className="h-5 w-5" />
                    {challengeTasks.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {challengeTasks.length}
                        </span>
                    )}
                </Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon" className="rounded-full bg-white/80 hover:bg-white/90">
                            <MessageSquare className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <ChatContent messages={messages} onShowFeedback={(response) => {
                        // 해당 AI 응답 직전의 사용자 메시지 찾기
                        const userMessage = messages.find(m => 
                            m.sender === 'user' && 
                            new Date(m.timestamp).getTime() < new Date((response as any).timestamp).getTime()
                        )?.content as string;
                        
                        // answer를 제외한 나머지 속성과 userMessage를 포함하여 AIFeedbackResponse 생성
                        const {  ...rest } = response;
                        setSelectedFeedback({
                            ...rest,
                            userMessage: userMessage || ""
                        });
                    }} />
                </Dialog>
                <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
                    <MessageFeedback response={selectedFeedback || undefined} />
                </Dialog>
            </div>

            {/* 도전과제 패널 */}
            <ChallengeTask 
              isOpen={isAchievementsOpen} 
              containerWidth={800} 
              challenge={mockChallengeData[0]}
            />

            {/* AI 응답 영역 */}
            <AIResponse response={lastAIResponse.answer} persona={persona} />
            
            {/* 채팅 입력 영역 */}
            <ChatInput 
                onSend={handleSendMessage} 
                disabled={isTrialEnded || mode === "trial" && messageCount >= maxTrialCount} 
            />

            {isTrialEnded && (
                <>
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <AlertDialog open={isTrialEnded}>
                            <AlertDialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-semibold">We grow together.</AlertDialogTitle>
                                    <AlertDialogDescription className="mt-2 text-gray-600">
                                        We hope you enjoyed your trial! Sign up now to unlock even more amazing content.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6 flex justify-end space-x-2">
                                    <AlertDialogAction className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => window.location.href="/sign-up"}>
                                        Sign up
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </>
            )}
        </div>
    );
}

export function ChatContainer(props: ChatContainerProps) {
    return (
        <WebSocketProvider mode={props.mode}>
            <ChatContainerContent {...props} />
        </WebSocketProvider>
    );
}