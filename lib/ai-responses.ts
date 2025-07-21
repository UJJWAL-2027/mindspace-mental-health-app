interface ChatContext {
  previousMessages: string[];
  userMood?: number;
  timeOfDay: string;
  conversationLength: number;
}

interface ResponsePattern {
  keywords: string[];
  responses: string[];
  followUpQuestions?: string[];
  mood?: 'supportive' | 'encouraging' | 'calming' | 'empowering';
}

const responsePatterns: ResponsePattern[] = [
  // Anxiety and Stress
  {
    keywords: ['anxious', 'anxiety', 'worried', 'panic', 'nervous', 'overwhelmed'],
    responses: [
      "I can hear that you're feeling anxious right now. That's completely understandable - anxiety is our mind's way of trying to protect us, even when it feels overwhelming.",
      "Anxiety can feel really intense. Let's try a grounding technique together: Can you name 5 things you can see around you right now?",
      "When anxiety hits, remember that feelings are temporary visitors - they come and they go. You've gotten through difficult moments before, and you can get through this one too.",
      "It sounds like you're carrying a lot right now. Sometimes anxiety is our body's way of telling us we need to slow down and breathe."
    ],
    followUpQuestions: [
      "What's one small thing that usually helps you feel a bit calmer?",
      "Have you noticed any patterns in when your anxiety tends to be stronger?",
      "What would you tell a good friend who was feeling the way you're feeling right now?"
    ],
    mood: 'calming'
  },

  // Depression and Sadness
  {
    keywords: ['depressed', 'sad', 'hopeless', 'empty', 'worthless', 'lonely', 'down'],
    responses: [
      "I'm really glad you felt comfortable sharing how you're feeling with me. Depression can make everything feel heavy and difficult, but reaching out shows incredible strength.",
      "Those feelings of sadness are valid and real. You don't have to carry them alone, and you don't have to feel guilty about having them.",
      "Even when everything feels dark, you're still here, still trying, still reaching out. That takes courage, even if it doesn't feel like it right now.",
      "Depression can make us forget our own worth, but your feelings matter, your experiences matter, and you matter."
    ],
    followUpQuestions: [
      "What's one tiny thing that brought you even a moment of peace recently?",
      "How has your sleep and eating been lately?",
      "Is there someone in your life you feel safe talking to about this?"
    ],
    mood: 'supportive'
  },

  // Stress and Pressure
  {
    keywords: ['stressed', 'pressure', 'deadline', 'work', 'school', 'busy', 'exhausted'],
    responses: [
      "It sounds like you're juggling a lot right now. Stress can be our body's way of telling us we're pushing our limits.",
      "When we're under pressure, it's easy to forget that we're human beings, not machines. You deserve rest and compassion, especially from yourself.",
      "Stress can make everything feel urgent and overwhelming. Let's take a step back - what's the most important thing you need to focus on right now?",
      "Being busy doesn't mean being productive, and being productive doesn't mean being worthy. Your value isn't determined by how much you accomplish."
    ],
    followUpQuestions: [
      "What's one thing you could take off your plate today, even temporarily?",
      "When did you last take a real break - not just scrolling your phone, but actually resting?",
      "What would 'good enough' look like for the thing that's stressing you most?"
    ],
    mood: 'calming'
  },

  // Relationships and Social Issues
  {
    keywords: ['relationship', 'friend', 'family', 'conflict', 'argument', 'misunderstood', 'rejected'],
    responses: [
      "Relationships can be one of the most rewarding and challenging parts of being human. It sounds like you're navigating something difficult right now.",
      "Conflict in relationships often happens when people care about each other but have different needs or perspectives. That doesn't make it less painful though.",
      "Feeling misunderstood can be really isolating. Your feelings about this situation are completely valid, regardless of how others might see it.",
      "Sometimes the people closest to us can hurt us the most, often without meaning to. It's okay to feel upset about that."
    ],
    followUpQuestions: [
      "What do you think the other person might be feeling or thinking about this situation?",
      "What would you need to feel heard and understood in this relationship?",
      "How do you usually handle conflict - do you tend to avoid it, confront it directly, or something else?"
    ],
    mood: 'supportive'
  },

  // Self-esteem and Confidence
  {
    keywords: ['confidence', 'self-esteem', 'failure', 'mistake', 'not good enough', 'imposter'],
    responses: [
      "Self-doubt can be so loud sometimes that it drowns out everything else. But that critical voice in your head isn't always telling you the truth.",
      "Making mistakes doesn't make you a failure - it makes you human. Every person you admire has failed at something, probably many times.",
      "Imposter syndrome is incredibly common, especially among people who are actually quite capable. Sometimes our biggest critics live inside our own heads.",
      "You're being really hard on yourself right now. What would you say to a friend who was talking about themselves the way you're talking about yourself?"
    ],
    followUpQuestions: [
      "Can you think of a time when you overcame something you initially thought you couldn't handle?",
      "What's one thing you've learned or improved at recently, even if it seems small?",
      "Who in your life sees your strengths clearly? What would they say about you right now?"
    ],
    mood: 'empowering'
  },

  // Sleep and Health
  {
    keywords: ['sleep', 'tired', 'insomnia', 'can\'t sleep', 'exhausted', 'fatigue'],
    responses: [
      "Sleep issues can affect everything - our mood, our thinking, our ability to cope with stress. It's really important that you're paying attention to this.",
      "When we can't sleep, it often creates a cycle where we worry about not sleeping, which makes it even harder to sleep. It's frustrating.",
      "Your body and mind need rest to function well. Poor sleep isn't a personal failing - there are many factors that can affect our sleep patterns.",
      "Sleep problems are often connected to stress, anxiety, or changes in our routine. Have you noticed any patterns in when sleep is more difficult?"
    ],
    followUpQuestions: [
      "What does your bedtime routine usually look like?",
      "Have you noticed if certain activities or thoughts make it harder to fall asleep?",
      "How long has sleep been challenging for you?"
    ],
    mood: 'calming'
  },

  // Positive and Grateful
  {
    keywords: ['grateful', 'thankful', 'happy', 'good day', 'accomplished', 'proud', 'excited'],
    responses: [
      "It's wonderful to hear some positivity in your voice! Celebrating the good moments, even small ones, is so important for our mental health.",
      "I love that you're taking time to notice and appreciate the good things. Gratitude can be a powerful tool for building resilience.",
      "It sounds like you're in a good space right now. These positive moments are worth savoring and remembering for times when things feel harder.",
      "Your happiness and excitement are contagious! It's beautiful when we can find joy in our daily experiences."
    ],
    followUpQuestions: [
      "What made this moment or day particularly special for you?",
      "How can you carry some of this positive energy forward?",
      "What are you most looking forward to right now?"
    ],
    mood: 'encouraging'
  }
];

const generalResponses = [
  "Thank you for sharing that with me. I'm here to listen and support you however I can.",
  "It takes courage to open up about what you're going through. I'm glad you felt comfortable sharing with me.",
  "I hear you, and what you're experiencing sounds really challenging. You're not alone in feeling this way.",
  "Your feelings are completely valid. It's okay to not be okay sometimes.",
  "I appreciate you trusting me with your thoughts. How are you taking care of yourself today?"
];

const followUpPrompts = [
  "Tell me more about that.",
  "How long have you been feeling this way?",
  "What's been most helpful for you in the past when dealing with similar feelings?",
  "What would make today feel a little bit better for you?",
  "Is there anything specific you'd like support with right now?"
];

export function generateAIResponse(
  userMessage: string, 
  context: ChatContext
): { message: string; followUp?: string } {
  const lowerMessage = userMessage.toLowerCase();
  const words = lowerMessage.split(/\s+/);
  
  // Find matching patterns
  const matchingPatterns = responsePatterns.filter(pattern =>
    pattern.keywords.some(keyword => 
      lowerMessage.includes(keyword) || 
      words.some(word => word.includes(keyword.split(' ')[0]))
    )
  );

  let selectedResponse: string;
  let followUp: string | undefined;

  if (matchingPatterns.length > 0) {
    // Use the first matching pattern (could be enhanced with scoring)
    const pattern = matchingPatterns[0];
    selectedResponse = pattern.responses[Math.floor(Math.random() * pattern.responses.length)];
    
    // Add follow-up question occasionally
    if (pattern.followUpQuestions && Math.random() > 0.6) {
      followUp = pattern.followUpQuestions[Math.floor(Math.random() * pattern.followUpQuestions.length)];
    }
  } else {
    // Use general response
    selectedResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];
    
    // Add follow-up prompt
    if (Math.random() > 0.5) {
      followUp = followUpPrompts[Math.floor(Math.random() * followUpPrompts.length)];
    }
  }

  // Personalize based on context
  if (context.conversationLength === 1) {
    selectedResponse = "Hello! I'm here to listen and support you. " + selectedResponse;
  }

  // Add time-based personalization
  const hour = new Date().getHours();
  if (hour < 12 && context.conversationLength === 1) {
    selectedResponse = "Good morning! " + selectedResponse;
  } else if (hour >= 18 && context.conversationLength === 1) {
    selectedResponse = "Good evening! " + selectedResponse;
  }

  // Combine response with follow-up if available
  const finalMessage = followUp ? `${selectedResponse}\n\n${followUp}` : selectedResponse;

  return {
    message: finalMessage,
    followUp
  };
}

export function analyzeMessageSentiment(message: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['happy', 'good', 'great', 'wonderful', 'excited', 'grateful', 'thankful', 'proud', 'accomplished'];
  const negativeWords = ['sad', 'depressed', 'anxious', 'worried', 'stressed', 'angry', 'frustrated', 'hopeless', 'lonely'];
  
  const lowerMessage = message.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}