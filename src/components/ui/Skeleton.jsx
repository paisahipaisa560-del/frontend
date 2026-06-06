export function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card rounded-xl p-4 space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-1/3 h-3" />
      </div>
      <Skeleton className="w-3/4 h-5" />
      <Skeleton className="w-full h-3" />
      <Skeleton className="w-2/3 h-3" />
    </div>
  );
}

export function SkeletonTable({ rows = 4, cols = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass rounded-xl px-3 py-2.5 flex items-center gap-3">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={`h-3 ${j === 0 ? 'w-1/3' : j === cols - 1 ? 'w-1/4 ml-auto' : 'w-1/5'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ rows = 4 }) {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass rounded-xl px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-7 h-7 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="w-20 h-2.5" />
              <Skeleton className="w-14 h-2" />
            </div>
          </div>
          <Skeleton className="w-16 h-3" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonLine({ width = '100%' }) {
  return <Skeleton className={`h-3`} style={{ width }} />;
}

export function DashboardSkeleton() {
  return (
    <div className="p-2 md:p-3 space-y-2.5">
      <SkeletonCard />
      <Skeleton className="w-full h-32 rounded-xl" />
      <SkeletonCard />
      <SkeletonList rows={4} />
      <SkeletonList rows={3} />
    </div>
  );
}

export function AviatorSkeleton() {
  return (
    <div className="p-2 md:p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-7 h-7 rounded-lg" />
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        <div className="lg:col-span-3">
          <Skeleton className="w-full h-[200px] sm:h-[260px] md:h-[340px] lg:h-[400px] rounded-xl" />
        </div>
        <div className="space-y-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="p-2 md:p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-6 h-6 rounded-lg" />
        <Skeleton className="w-32 h-4" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="p-2 md:p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="w-6 h-6 rounded-lg" />
        <Skeleton className="w-28 h-4" />
      </div>
      <SkeletonList rows={5} />
    </div>
  );
}
