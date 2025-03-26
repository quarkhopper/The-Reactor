import { useEffect, useRef } from 'react';

function App() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const container = containerRef.current;
    if (button && container) {
      console.log('💣 BUTTON BOUNDS:', button.getBoundingClientRect());
      console.log('📦 CONTAINER BOUNDS:', container.getBoundingClientRect());
    }
  }, []);

  return (
    <div className="flex justify-center items-center w-screen h-screen bg-black border-8 border-red-600">
      <div
        ref={containerRef}
        className="relative w-[400px] h-[72] border-4 border-white"
        style={{
          outline: '4px dashed orange',
          backgroundColor: 'yellow',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        <p style={{ color: 'black', fontWeight: 'bold' }}>CONTAINER DEBUG TEXT</p>

        <div
          ref={buttonRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 text-xl font-bold border-4 text-white"
          style={{
            background: 'repeating-linear-gradient(45deg, lime, green 10px, lime 20px)',
            borderColor: 'magenta',
            animation: 'spin 1.5s linear infinite',
          }}
        >
          💥 CENTERED 💥
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default App;
