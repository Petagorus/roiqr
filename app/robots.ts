import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * robots.txt: everything public is crawlable. AI crawlers are listed
 * explicitly (SEO/AEO/GEO): their content is meant to be read, answered and
 * cited by search, assistant and generative engines.
 */
export default function robots(): MetadataRoute.Robots {
  const aiCrawlers = [
    // OpenAI
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    // Anthropic
    "ClaudeBot",
    "Claude-User",
    "Claude-SearchBot",
    // Perplexity
    "PerplexityBot",
    "Perplexity-User",
    // Google (AI training / grounding; regular Googlebot is covered by "*")
    "Google-Extended",
    // Others commonly used by answer engines
    "Applebot-Extended",
    "CCBot",
    "Amazonbot",
    "meta-externalagent",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...aiCrawlers.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
