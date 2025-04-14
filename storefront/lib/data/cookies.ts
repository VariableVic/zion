import "server-only";
import { cookies as nextCookies } from "next/headers";

export const getAuthHeaders = async (): Promise<
  { authorization: string } | {}
> => {
  const cookies = await nextCookies();
  const token = cookies.get("_medusa_jwt")?.value;

  if (!token) {
    return {};
  }

  return { authorization: `Bearer ${token}` };
};

export const getGaClientId = async (): Promise<string | null> => {
  const cookies = await nextCookies();
  const gaClientIdCookie = cookies.get("_ga")?.value;

  const gaClientId = (gaClientIdCookie as string)
    .split(".")
    .slice(-2)
    .join(".");

  return gaClientId;
};

export const getCanvasId = async (): Promise<string | null> => {
  const cookies = await nextCookies();
  return cookies.get("_zion_canvas_id")?.value || null;
};

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const canvasId = await getCanvasId();

    if (!canvasId) {
      return "";
    }

    return `${tag}-${canvasId}`;
  } catch (error) {
    return "";
  }
};

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | {}> => {
  if (typeof window !== "undefined") {
    return {};
  }

  const cacheTag = await getCacheTag(tag);

  if (!cacheTag) {
    return {};
  }

  return { tags: [`${cacheTag}`] };
};

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies();
  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
};

export const removeAuthToken = async () => {
  const cookies = await nextCookies();
  cookies.set("_medusa_jwt", "", {
    maxAge: -1,
  });
};

export const getCartId = async () => {
  const cookies = await nextCookies();
  return cookies.get("_medusa_cart_id")?.value;
};

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies();
  cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
};

export const removeCartId = async () => {
  const cookies = await nextCookies();
  cookies.set("_medusa_cart_id", "", {
    maxAge: -1,
  });
};

export const removeCanvasId = async () => {
  const cookies = await nextCookies();
  cookies.set("_zion_canvas_id", "", {
    maxAge: -1,
  });
};
