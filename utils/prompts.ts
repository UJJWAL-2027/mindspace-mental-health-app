export function getPrompt(): string {
  const prompts = [
    "What are you grateful for today?",
    "Describe a positive experience you had recently.",
    "Write about something that made you smile.",
    "How are you feeling right now?",
    "What is one thing you want to achieve this week?"
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
}