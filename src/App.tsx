import { ToDo } from "@/components/toDo"
import { ThemeProvider } from 'next-themes';;

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" storageKey="theme">
      <ToDo />
    </ThemeProvider>
  );
}

export default App;
