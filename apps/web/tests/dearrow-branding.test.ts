import { expect, test } from "bun:test";
import { resolveDeArrowBranding } from "../src/lib/api-dearrow";

const fallback = { title: "Original title", thumbnail: "original.jpg" };

test("uses contributed DeArrow branding", () => {
  const branding = resolveDeArrowBranding(
    {
      videoId: "dQw4w9WgXcQ",
      title: "Clear title",
      thumbnailUrl: "/api/dearrow/thumbnail",
      attributionUrl: "https://dearrow.ajay.app",
    },
    fallback,
  );

  expect(branding).toEqual({ title: "Clear title", thumbnail: "/api/dearrow/thumbnail" });
});

test("keeps original branding without a contribution", () => {
  const branding = resolveDeArrowBranding(
    {
      videoId: "stZ3ZoR_8eg",
      title: null,
      thumbnailUrl: null,
      attributionUrl: "https://dearrow.ajay.app",
    },
    fallback,
  );

  expect(branding).toEqual(fallback);
});
