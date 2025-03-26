interface CanvasProps {
    children: React.ReactNode;
  }
  
export default function Canvas({ children }: CanvasProps) {
  return (
    <div className="relative w-[900px] h-[600px] bg-neutral-900 border-4 border-white">
      {children}
    </div>
  );
}
  