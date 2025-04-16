"use server";

import { sdk } from "@/lib/medusa";
import { HttpTypes } from "@medusajs/types";
import { getAuthHeaders, getCacheOptions } from "./cookies";
import { getRegion, retrieveRegion } from "./regions";

export const retrieveProduct = async ({ id }: { id: string }) => {
  const headers = {
    ...(await getAuthHeaders()),
  };

  const next = {
    ...(await getCacheOptions(`products-${id}`)),
  };

  const region = await getRegion("us");

  return sdk.client
    .fetch<HttpTypes.StoreProductResponse>(`/store/products/${id}`, {
      method: "GET",
      query: {
        region_id: region?.id,
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ product }) => {
      return {
        product,
      };
    });
};

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
  countryCode?: string;
  regionId?: string;
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number };
  nextPage: number | null;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required");
  }

  const limit = queryParams?.limit || 12;
  const _pageParam = Math.max(pageParam, 1);
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit;

  let region: HttpTypes.StoreRegion | undefined | null;

  if (countryCode) {
    region = await getRegion(countryCode);
  } else {
    region = await retrieveRegion(regionId!);
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    };
  }

  const headers = {
    ...(await getAuthHeaders()),
  };

  const next = {
    ...(await getCacheOptions("products")),
  };

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null;

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      };
    });
};
