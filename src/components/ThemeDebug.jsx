import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeDebug() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [classDetails, setClassDetails] = useState("");

  useEffect(() => {
    setMounted(true);
    const observer = setInterval(() => {
      const html = document.documentElement;
      const classList = Array.from(html.classList);
      const classAttr = html.getAttribute('class');
      
      setClassDetails(`classList: [${classList.join(', ')}], classAttr: "${classAttr}"`);
      
      console.log("Theme Debug:", {
        theme,
        resolvedTheme,
        classList,
        classAttr,
        htmlElement: html.outerHTML.substring(0, 100),
      });
    }, 500);
    return () => clearInterval(observer);
  }, [theme, resolvedTheme]);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-0 left-0 bg-black text-white p-2 text-xs z-[9999] max-w-md">
      <div>Theme: {theme} | Resolved: {resolvedTheme}</div>
      <div className="break-words">{classDetails}</div>
    </div>
  );
}
