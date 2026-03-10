export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4">
        {/* Sleek monochrome spinner */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 border-2 border-gray-100 rounded-full" />
          <div className="absolute inset-0 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-sm font-medium text-gray-500 tracking-wide animate-pulse">
          Loading content...
        </div>
      </div>
    </div>
  );
}
