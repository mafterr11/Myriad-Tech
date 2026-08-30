export default function AdminLoading() {
  return (
    <div className="min-h-screen pt-36 pb-24 sm:pt-44" aria-busy="true">
      <div className="container">
        <span className="sr-only">Loading administration dashboard</span>
        <div className="h-10 w-64 animate-pulse bg-black/10 motion-reduce:animate-none" />
        <div className="mt-5 h-5 w-full max-w-xl animate-pulse bg-black/10 motion-reduce:animate-none" />
        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="border-line h-24 animate-pulse border bg-white/55 motion-reduce:animate-none"
            />
          ))}
        </div>
        <div className="border-line mt-8 h-64 animate-pulse border bg-white/55 motion-reduce:animate-none" />
      </div>
    </div>
  );
}
