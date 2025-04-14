import { Suspense } from "react";
import { Storefront } from "@/components/storefront";
import { StorefrontSkeleton } from "@/components/storefront-skeleton";

export default async function Home({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;

  return (
    <main className="flex min-h-screen flex-col">
      <Suspense fallback={<StorefrontSkeleton />}>
        <Storefront path={path} />
      </Suspense>
    </main>
  );
}
