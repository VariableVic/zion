import { Skeleton } from "@/components/ui/skeleton";

export function AiCanvasSkeleton() {
  return (
    <div className="flex flex-col h-full w-1/2 overflow-hidden space-y-4 rounded-lg border p-6">
      <div className="flex flex-col h-full w-full items-center justify-center space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
  );
}
