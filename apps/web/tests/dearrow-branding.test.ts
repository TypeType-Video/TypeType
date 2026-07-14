import { expect, test } from "bun:test";
import { type DeArrowItem, resolveDeArrowBranding } from "../src/lib/api-dearrow";

const fallback = { title: "Original title", thumbnail: "original.jpg" };
const item: DeArrowItem = {
  videoId: "dQw4w9WgXcQ",
  title: "Legacy title",
  thumbnailUrl: "/legacy.jpg",
  titles: [
    { title: "Rejected", original: false, votes: -2, locked: false, uuid: "1" },
    { title: "Accepted", original: false, votes: 1, locked: false, uuid: "2" },
    { title: "Locked", original: false, votes: -1, locked: true, uuid: "3" },
  ],
  thumbnails: [
    {
      timestamp: 12,
      thumbnailUrl: "/rejected.jpg",
      original: false,
      votes: -2,
      locked: false,
      uuid: "4",
    },
    {
      timestamp: 24,
      thumbnailUrl: "/accepted.jpg",
      original: false,
      votes: 0,
      locked: false,
      uuid: "5",
    },
  ],
  randomTime: 0.4,
  videoDuration: 100,
  attributionUrl: "https://dearrow.ajay.app",
};

test("uses the first accepted community candidates", () => {
  expect(resolveDeArrowBranding(item, fallback)).toEqual({
    title: "Accepted",
    thumbnail: "/accepted.jpg",
  });
});

test("supports original branding and locked-only confidence", () => {
  expect(
    resolveDeArrowBranding(item, fallback, {
      titleMode: "original",
      thumbnailMode: "original",
      trustMode: "locked",
    }),
  ).toEqual(fallback);
  expect(
    resolveDeArrowBranding(item, fallback, {
      titleMode: "dearrow",
      thumbnailMode: "dearrow",
      trustMode: "locked",
    }).title,
  ).toBe("Locked");
});

test("uses a neutral frame when requested or when no community thumbnail exists", () => {
  const withoutThumbnail = { ...item, thumbnails: [] };
  const random = "/api/dearrow/thumbnail?videoId=dQw4w9WgXcQ&time=40";
  expect(
    resolveDeArrowBranding(withoutThumbnail, fallback, {
      titleMode: "dearrow",
      thumbnailMode: "random",
      trustMode: "accepted",
    }).thumbnail,
  ).toBe(random);
  expect(
    resolveDeArrowBranding(withoutThumbnail, fallback, {
      titleMode: "dearrow",
      thumbnailMode: "dearrow_or_random",
      trustMode: "accepted",
    }).thumbnail,
  ).toBe(random);
});

test("keeps originals when the ordered accepted candidate is original", () => {
  const originalFirst = {
    ...item,
    titles: [{ title: "Original", original: true, votes: 0, locked: false, uuid: "6" }],
    thumbnails: [
      { timestamp: null, thumbnailUrl: null, original: true, votes: 0, locked: false, uuid: "7" },
    ],
  };
  expect(resolveDeArrowBranding(originalFirst, fallback)).toEqual(fallback);
});
