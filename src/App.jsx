import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function App() {
  const headingRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Animate heading on mount
    gsap.from(headingRef.current, {
      duration: 1,
      opacity: 1,
      y: -30,
      ease: 'back.out',
    });

    // Animate button on mount
    gsap.from(buttonRef.current, {
      duration: 1,
      delay: 0.3,
      opacity: 1,
      scale: 0.8,
      ease: 'back.out',
    });
  }, []);

  const handleButtonClick = () => {
    gsap.to(headingRef.current, {
      duration: 0.6,
      rotation: 360,
      color: '#ffffff',
      ease: 'power2.inOut',
    });

    gsap.to(buttonRef.current, {
      duration: 0.4,
      scale: 1.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    });
  };

  return (
    <div className="p-10 bg-red-900 min-h-screen flex flex-col items-center justify-center">
      <h1 ref={headingRef} className="text-4xl font-bold text-black mb-4">
        Tailwind is working!
      </h1>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="mt-4 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors cursor-pointer"
      >
        Click me to animate!
      </button>
    </div>
  );
}

export default App;