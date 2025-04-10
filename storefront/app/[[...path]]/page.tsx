import { Suspense } from "react";
import { Storefront } from "@/components/storefront";
import { StorefrontSkeleton } from "@/components/storefront-skeleton";

export default function Home({ params }: { params: { path: string[] } }) {
  const path = params.path;

  return (
    <main className="flex min-h-screen flex-col">
      <Suspense fallback={<StorefrontSkeleton />}>
        <Storefront path={path} />
      </Suspense>
    </main>
  );
}
