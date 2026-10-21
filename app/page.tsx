import { Faq } from "@/components/faq";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { Generator } from "@/components/generator";
import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { buildSeoJsonLd } from "@/lib/seo";

export default function Page() {
  return (
    <>
      {/* Structured data for search, answer and generative engines. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSeoJsonLd()) }}
      />
      <Nav />
      <main className="min-h-screen">
        <Hero />
        <Generator />
        <Features />
        <Faq />
        <Footer />
      </main>
    </>
  );
}
