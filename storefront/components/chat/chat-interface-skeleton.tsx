import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ChatInterfaceSkeleton() {
  return (
    <Card className="flex flex-col h-full w-1/2">
      {/* Category Bar Skeleton */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Chat Messages Skeleton */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex items-start gap-4">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-16 w-3/4 rounded-lg" />
        </div>
        <div className="flex items-start justify-end gap-4">
          <Skeleton className="h-12 w-1/2 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <div className="flex items-start gap-4">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-20 w-2/3 rounded-lg" />
        </div>
      </div>

      {/* Input Area Skeleton */}
      <div className="p-4 border-t flex items-center gap-2">
        <Skeleton className="flex-1 h-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </Card>
  );
}
