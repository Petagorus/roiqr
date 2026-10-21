import { Kanit } from "next/font/google";

/**
 * Kanit is the single typeface for the whole product — headings, body,
 * labels, metadata. It supports Thai and Latin scripts, keeping weight
 * contrast inside the family to build the visual hierarchy.
 */
export const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-kanit",
});
