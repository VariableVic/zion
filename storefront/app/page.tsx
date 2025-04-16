import { Suspense } from "react";
import { Storefront } from "@/components/storefront";
import { StorefrontSkeleton } from "@/components/storefront-skeleton";

export default async function Home() {
  return (
    <main className="flex h-full min-h-screen flex-col">
      <Suspense fallback={<StorefrontSkeleton />}>
        <Storefront />
      </Suspense>
    </main>
  );
}
