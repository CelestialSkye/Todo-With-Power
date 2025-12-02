import { useRef } from "react";

export function ThemeTransition({ children, onTransitionStart }) {
  const buttonRef = useRef(null);

  const handleThemeChange = () => {
    // Fallback for browsers that don't support View Transition API
    if (!document.startViewTransition) {
      onTransitionStart();
      return;
    }

    // Use View Transition API for smooth theme switch
    document.startViewTransition(() => {
      onTransitionStart();
    });
  };

  return (
    <>
      {/* Pass handler and ref to children */}
      {children({ handleThemeChange, buttonRef })}
    </>
  );
}
