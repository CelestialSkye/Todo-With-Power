import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

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
      <div className="p-10 bg-red-900 min-h-screen">
        <div className="flex flex-col items-center justify-center mb-8">
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
          
          <Card className="mt-8 w-80">
            <CardHeader>
              <CardTitle>Test Card</CardTitle>
              <CardDescription>This is a test of the Card component</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content goes here</p>
            </CardContent>
          </Card>
        </div>

        
      </div>
    );
}

export default App;