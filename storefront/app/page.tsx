import { Storefront } from "@/components/storefront";

export default async function Home() {
  return (
    <main className="flex h-full min-h-screen flex-col">
      <Storefront />
    </main>
  );
}
