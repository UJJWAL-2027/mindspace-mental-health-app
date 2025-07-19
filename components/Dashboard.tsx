import AuthButton from "./AuthButton";
import Chatbot from "./Chatbot";
import Journaling from "./Journaling";
import MoodTracker from "./MoodTracker";

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <AuthButton />
      <Chatbot />
      <Journaling />
      <MoodTracker />
    </div>
  );
}