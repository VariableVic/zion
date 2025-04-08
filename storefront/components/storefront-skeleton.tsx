import { Skeleton } from "@/components/ui/skeleton"

export function StorefrontSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <div className="h-16 border-b px-4 flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <div className="flex space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="flex flex-1">
        <div className="flex-1 p-8">
          <Skeleton className="h-[calc(100vh-8rem)] w-full rounded-xl" />
        </div>
        <div className="w-80 border-l p-4">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

