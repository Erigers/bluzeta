export default function Loading() {
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] rounded-[1.2rem] bg-line" />
          <div className="mt-3 h-4 w-3/4 rounded bg-line" />
        </div>
      ))}
    </div>
  );
}
