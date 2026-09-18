export function LoadingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800/80 animate-pulse flex flex-col"
        >
          <div className="aspect-[2/3] w-full bg-slate-800/70" />
          <div className="p-3.5 space-y-2.5">
            <div className="h-4 bg-slate-800 rounded w-4/5" />
            <div className="flex items-center justify-between">
              <div className="h-3 bg-slate-800 rounded w-1/4" />
              <div className="h-3 bg-slate-800 rounded w-1/3" />
            </div>
            <div className="flex gap-1.5 pt-1">
              <div className="h-4 w-12 bg-slate-800/80 rounded" />
              <div className="h-4 w-14 bg-slate-800/80 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
