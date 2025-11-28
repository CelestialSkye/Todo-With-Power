import { ToDo } from "@/components/toDo"
import { ThemeProvider } from 'next-themes';
import ChatBox from '@/components/ChatBox'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" storageKey="theme">
      <ToDo />
      <ChatBox />
    </ThemeProvider>
  );
}

export default App;
