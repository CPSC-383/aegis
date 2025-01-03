export default function TopOverlay() {
  return (
    <div className="fixed left-0 top-0 z-30 m-0 h-16 w-full sm:h-28 bg-transparent pointer-events-none backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(transparent_1px,_#0d0d12_1px)] bg-[size:2px_2px]"></div>
    </div>
  );
}
