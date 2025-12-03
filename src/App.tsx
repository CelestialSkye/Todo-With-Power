import { ToDo } from "@/components/toDo"
import { ThemeProvider } from 'next-themes';
import ChatBox from '@/components/ChatBox'
import { useRecaptcha } from '@/hooks/useRecaptcha'

function App() {
  useRecaptcha();

  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      storageKey="theme" 
      enableSystem={false}
    >
      <ToDo />
      <ChatBox />
    </ThemeProvider>
  );
}

export default App;
