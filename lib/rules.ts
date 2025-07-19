export function getResponse(input: string): string {
  if (!input) return "Please type something!";
  // Basic AI stub
  if (input.toLowerCase().includes("sad")) return "I'm sorry you're feeling sad. Want to talk more?";
  if (input.toLowerCase().includes("happy")) return "That's great to hear! Share what made you happy.";
  return "Tell me more!";
}