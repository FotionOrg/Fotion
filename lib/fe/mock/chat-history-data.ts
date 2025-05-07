import { ChatMessage } from "@/types/chat";

export const mockChatHistoryData:ChatMessage[] = [
    // Example 1
    {
      id: '1',
      content: 'I am so tired?',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60).toISOString(),
    },
    {
      id: '2',
      content: {
        answer: "I understand! You might want to say, \"I'm so tired.\" The question mark is not needed here. What made you tired?",
        evaluation: {
          comprehension: 4,
          grammar_accuracy: 3,
          sentence_naturalness: 3,
          vocabulary_naturalness: 4
        },
        total_score: 3.5,
        feedback: {
          grammar_accuracy: {
            issue: "Grammar Accuracy",
            count: 1,
            details: [
              {
                sub_issue: "Punctuation Errors",
                count: 1,
                description: "문장의 끝에 물음표를 빼세요."
              }
            ]
          },
          sentence_naturalness: {
            issue: "Sentence Naturalness",
            count: 0,
            details: []
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
          en: "Your message is clear, but make sure to avoid unnecessary punctuation. Keep practicing!",
          ko: "당신의 메시지는 분명하지만, 불필요한 구두점을 피하세요. 계속 연습하세요!"
        },
        difficulty_level: "easy"
      },
      sender: 'assistant',
      timestamp: new Date().toISOString(),
    },
  
    // Example 2
    {
      id: '3',
      content: 'Where is the bathroom?',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    },
    {
      id: '4',
      content: {
        answer: "That's a perfect question! Your grammar and word choice are excellent. The bathroom is often down the hall to the right in many buildings.",
        evaluation: {
          comprehension: 5,
          grammar_accuracy: 5,
          sentence_naturalness: 5,
          vocabulary_naturalness: 5
        },
        total_score: 5.0,
        feedback: {
          grammar_accuracy: {
            issue: "Grammar Accuracy",
            count: 0,
            details: []
          },
          sentence_naturalness: {
            issue: "Sentence Naturalness",
            count: 0,
            details: []
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
          en: "Excellent job! Your question is perfect and very natural.",
          ko: "아주 잘했어요! 질문이 완벽하고 매우 자연스럽습니다."
        },
        difficulty_level: "easy"
      },
      sender: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
  
    // Example 3
    {
      id: '5',
      content: 'I have been go to the store yesterday.',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: '6',
      content: {
        answer: "I think you wanted to say, \"I went to the store yesterday.\" When talking about a completed action in the past, use the simple past tense, not present perfect with 'have been'.",
        evaluation: {
          comprehension: 4,
          grammar_accuracy: 2,
          sentence_naturalness: 2,
          vocabulary_naturalness: 4
        },
        total_score: 3.0,
        feedback: {
          grammar_accuracy: {
            issue: "Grammar Accuracy",
            count: 2,
            details: [
              {
                sub_issue: "Verb Tense Errors",
                count: 1,
                description: "과거의 완료된 행동에는 'I went'와 같은 단순과거 시제를 사용하세요."
              },
              {
                sub_issue: "Verb Form Errors",
                count: 1,
                description: "'have been go'는 잘못된 형태입니다. 'have been'과 함께 동사의 -ing 형태를 사용하거나, 과거 시제 'went'를 사용하세요."
              }
            ]
          },
          sentence_naturalness: {
            issue: "Sentence Naturalness",
            count: 1,
            details: [
              {
                sub_issue: "Awkward Expressions",
                count: 1,
                description: "'have been go'는 자연스럽지 않은 표현입니다."
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
          en: "I understand what you're trying to say, but there's a tense mistake. For completed past actions, use simple past tense (went) instead of present perfect (have been).",
          ko: "말하려는 내용은 이해가 되지만, 시제 오류가 있습니다. 과거에 완료된 행동은 현재완료(have been) 대신 단순과거(went)를 사용하세요."
        },
        difficulty_level: "intermediate"
      },
      sender: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    },
  
    // Example 4
    {
      id: '7',
      content: 'Can I get the recipe for making kimchi?',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    },
    {
      id: '8',
      content: {
        answer: "Great question! Your sentence structure is perfect. Yes, I'd be happy to provide a kimchi recipe if I could. This is a very natural way to ask for information.",
        evaluation: {
          comprehension: 5,
          grammar_accuracy: 5,
          sentence_naturalness: 5,
          vocabulary_naturalness: 5
        },
        total_score: 5.0,
        feedback: {
          grammar_accuracy: {
            issue: "Grammar Accuracy",
            count: 0,
            details: []
          },
          sentence_naturalness: {
            issue: "Sentence Naturalness",
            count: 0,
            details: []
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
          en: "Excellent! Your question is grammatically perfect and very natural. This is exactly how a native speaker would ask this question.",
          ko: "훌륭합니다! 문법적으로 완벽하고 매우 자연스러운 질문입니다. 원어민이 정확히 이런 방식으로 질문할 것입니다."
        },
        difficulty_level: "intermediate"
      },
      sender: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 6).toISOString(),
    },
  
    // Example 5
    {
      id: '9',
      content: 'The weather is very good today, isn\'t it?',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
    },
    {
      id: '10',
      content: {
        answer: "Yes, it is! Your question is perfect - you've used a tag question correctly, which many English learners find challenging. This shows advanced skill in conversation.",
        evaluation: {
          comprehension: 5,
          grammar_accuracy: 5,
          sentence_naturalness: 5,
          vocabulary_naturalness: 5
        },
        total_score: 5.0,
        feedback: {
          grammar_accuracy: {
            issue: "Grammar Accuracy",
            count: 0,
            details: []
          },
          sentence_naturalness: {
            issue: "Sentence Naturalness",
            count: 0,
            details: []
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
          en: "Excellent use of a tag question! This is a very natural way to make small talk about the weather, just like native speakers do.",
          ko: "부가 의문문을 훌륭하게 사용했습니다! 이것은 원어민처럼 날씨에 대해 일상적인 대화를 나누는 매우 자연스러운 방법입니다."
        },
        difficulty_level: "intermediate"
      },
      sender: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
  
    // Example 6
    {
      id: '11',
      content: 'I\'m sorry for disturb you.',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    },
    {
      id: '12',
      content: {
        answer: "You're close! A better way to say this would be: \"I'm sorry for disturbing you.\" When using 'for' in this structure, the verb needs to be in the -ing form.",
        evaluation: {
          comprehension: 5,
          grammar_accuracy: 3,
          sentence_naturalness: 3,
          vocabulary_naturalness: 4
        },
        total_score: 3.75,
        feedback: {
          grammar_accuracy: {
            issue: "Grammar Accuracy",
            count: 1,
            details: [
              {
                sub_issue: "Verb Form Errors",
                count: 1,
                description: "'for' 다음에는 동명사(gerund) 형태를 사용해야 합니다. 'disturb' 대신 'disturbing'을 사용하세요."
              }
            ]
          },
          sentence_naturalness: {
            issue: "Sentence Naturalness",
            count: 1,
            details: [
              {
                sub_issue: "Word Form Issues",
                count: 1,
                description: "'disturb' 대신 'disturbing'을 사용하면 더 자연스럽습니다."
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
          en: "Your meaning is clear, but remember that 'for' should be followed by a gerund (-ing form). Say 'sorry for disturbing you' instead.",
          ko: "의미는 명확하지만, 'for' 다음에는 동명사(-ing 형태)가 와야 합니다. 'sorry for disturb you' 대신 'sorry for disturbing you'라고 말하세요."
        },
        difficulty_level: "intermediate"
      },
      sender: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    }
  ]