function App() {
  return (
    <div className="flex justify-center items-center w-screen h-screen bg-black">
      <div className="relative w-[400px] h-[300px] bg-yellow-400 border-4 border-white">
        <div
          className="absolute bg-green-400 border border-black text-white text-sm px-2 py-1"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          CENTERED
        </div>
      </div>
    </div>
  );
}

export default App;
