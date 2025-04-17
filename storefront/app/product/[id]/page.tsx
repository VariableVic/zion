import { ProductDrawer } from "@/components/canvas/product-drawer";
import { Storefront } from "@/components/storefront";
import { Drawer } from "@/components/ui/drawer";
import { retrieveProduct } from "@/lib/data/products";
import { sdk } from "@/lib/medusa";

export const generateStaticParams = async () => {
  return sdk.store.product
    .list({
      limit: 100,
    })
    .then(({ products }) => {
      return products.map((product) => ({
        id: product.id,
      }));
    });
};

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const productId = (await params).id;

  const { product } = await retrieveProduct({ id: productId });

  const productData = {
    id: product?.variants?.[0]?.id,
    product_id: product.id,
    name: product.title,
    description: product.description || "",
    price: product?.variants?.[0]?.calculated_price?.calculated_amount || 0,
    images: product?.images?.map((image) => image.url) || [],
    thumbnail: product?.thumbnail || "",
  };

  return (
    <main className="flex h-full min-h-screen flex-col">
      <Storefront />
      <Drawer open={true}>
        <ProductDrawer {...productData} />
      </Drawer>
    </main>
  );
}
