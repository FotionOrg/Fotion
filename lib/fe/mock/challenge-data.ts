import { AIResponse } from "../../../types/chat";

export const mockChallengeData: AIResponse[] = [
  {
    answer: "I understand! You might want to say, \"I need to practice English pronunciation.\" The word 'engash' seems to be a typo. What specific pronunciation do you want to focus on?",
    evaluation: {
      comprehension: 4,
      grammar_accuracy: 3,
      sentence_naturalness: 3,
      vocabulary_naturalness: 3
    },
    total_score: 3.25,
    feedback: {
      grammar_accuracy: {
        issue: "Grammar Accuracy",
        count: 1,
        details: [
          {
            sub_issue: "Spelling Errors",
            count: 1,
            description: "'engash'는 오타입니다. 'English'로 수정하세요."
          }
        ]
      },
      sentence_naturalness: {
        issue: "Sentence Naturalness",
        count: 1,
        details: [
          {
            sub_issue: "Word Order Issues",
            count: 1,
            description: "정확한 문장은 'I need to practice English pronunciation'입니다."
          }
        ]
      },
      vocabulary_naturalness: {
        issue: "Vocabulary Naturalness",
        count: 0,
        details: []
      },
      comprehension: {
        issue: "Comprehension",
        count: 0,
        details: []
      }
    },
    total_feedback: {
      en: "Your message is understandable, but there are some spelling and wording issues. Keep practicing!",
      ko: "당신의 메시지는 이해할 수 있지만, 몇 가지 철자와 문장 구조 문제가 있습니다. 계속 연습하세요!"
    },
    difficulty_level: "medium"
  }
]; 