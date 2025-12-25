export default function OverviewLoading() {
  return (
    <div className="animate-pulse">
      {/* Loading skeleton will be implemented here */}
      <div className="h-8 bg-muted rounded w-1/4 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded"></div>
        ))}
      </div>
      <div className="h-80 bg-muted rounded"></div>
    </div>
  );
}
