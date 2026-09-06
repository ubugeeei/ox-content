import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { clearTweetCache } from "./twitter/fetch";
import { transformFetchedTweets } from "./twitter/transform";
import type { TweetProfileImageShape, TwitterEmbedOptions } from "./twitter/types";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  clearTweetCache();
});

describe("fetched Twitter avatar shapes", () => {
  it("marks compact top-level and quoted avatars from profile_image_shape", async () => {
    const circleRootSquareQuote = await renderCard({
      text: "Root",
      id_str: "555",
      user: user("Root", "root", "Circle"),
      quoted_tweet: {
        text: "Quote",
        id_str: "99",
        user: user("Quote", "quote", "Square"),
      },
    });
    expect(circleRootSquareQuote).toContain(
      '<img class="ox-tweet__avatar ox-tweet__avatar--circle" src="/tweets/555-avatar.jpg"',
    );
    expect(circleRootSquareQuote).toContain(
      '<img class="ox-tweet__avatar ox-tweet__avatar--square" src="/tweets/555-quoted-avatar.jpg"',
    );

    const squareRootCircleQuote = await renderCard({
      text: "Root",
      id_str: "555",
      user: user("Root", "root", "Square"),
      quoted_tweet: {
        text: "Quote",
        id_str: "99",
        user: user("Quote", "quote", "Circle"),
      },
    });
    expect(squareRootCircleQuote).toContain(
      '<img class="ox-tweet__avatar ox-tweet__avatar--square" src="/tweets/555-avatar.jpg"',
    );
    expect(squareRootCircleQuote).toContain(
      '<img class="ox-tweet__avatar ox-tweet__avatar--circle" src="/tweets/555-quoted-avatar.jpg"',
    );
  });

  it("marks full top-level and quoted avatars from profile_image_shape", async () => {
    const html = await renderCard(
      {
        text: "Root",
        id_str: "555",
        user: user("Root", "root", "Square"),
        quoted_tweet: {
          text: "Quote",
          id_str: "99",
          user: user("Quote", "quote", "Circle"),
        },
      },
      { appearance: "full" },
    );
    expect(html).toContain(
      '<img class="ox-tweet__avatar ox-tweet__avatar--square" src="/tweets/555-avatar.jpg" alt="" width="48" height="48"',
    );
    expect(html).toContain(
      '<img class="ox-tweet__avatar ox-tweet__avatar--circle" src="/tweets/555-quoted-avatar.jpg" alt="" width="20" height="20"',
    );
  });

  it("defaults missing or unknown avatar shapes to Circle", async () => {
    const missing = await renderCard({ text: "Root", user: user("Root", "root") });
    expect(missing).toContain('class="ox-tweet__avatar ox-tweet__avatar--circle"');

    const unknown = await renderCard({ text: "Root", user: user("Root", "root", "Hexagon") });
    expect(unknown).toContain('class="ox-tweet__avatar ox-tweet__avatar--circle"');
  });
});

function user(name: string, screenName: string, shape?: TweetProfileImageShape) {
  return {
    name,
    screen_name: screenName,
    profile_image_url_https: `https://pbs.twimg.com/profile_images/${screenName}_normal.jpg`,
    profile_image_shape: shape,
  };
}

async function renderCard(data: unknown, twitter: TwitterEmbedOptions = {}): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "ox-tweet-avatar-shapes-"));
  globalThis.fetch = async (input) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith("https://cdn.syndication.twimg.com/")) {
      return { ok: true, json: async () => data } as Response;
    }
    return { ok: true, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer } as Response;
  };
  try {
    return await transformFetchedTweets('<XPost id="555" />', {
      fetch: true,
      cache: false,
      mediaOutputDir: path.join(root, "media"),
      mediaPublicPath: "/tweets",
      ...twitter,
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
