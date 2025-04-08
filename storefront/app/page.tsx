import { Suspense } from "react"
import { Storefront } from "@/components/storefront"
import { StorefrontSkeleton } from "@/components/storefront-skeleton"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Suspense fallback={<StorefrontSkeleton />}>
        <Storefront />
      </Suspense>
    </main>
  )
}

