import type { Metadata, Viewport } from "next";
import { Figtree, Inter } from "next/font/google";
import Link from "next/link";
import { ViewTransition } from "react";
import { NavLinks } from "@/components/NavLinks";
import { Footer, Logo } from "@/components/ui";
import { siteUrl } from "@/lib/site-url";
import "./tokens.css";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "Maintain Pavements · SuperBase bound hardstand", template: "%s · Maintain Pavements" },
  description:
    "SuperBase is a bonding agent dosed into the yard base you already have, then graded, rolled and compacted into a bound hardstand. Built with a grader, water cart and roller, with no paving crew and no pour.",
  openGraph: { siteName: "Maintain Pavements", locale: "en_AU", type: "website" },
};

export const viewport: Viewport = { themeColor: "#26282B" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={`${figtree.variable} ${inter.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header className="nav">
          <div className="wrap">
            <Link href="/" className="home" aria-label="Maintain Pavements home">
              <Logo />
            </Link>
            <NavLinks />
          </div>
        </header>
        <ViewTransition default="page">
          <main id="main" tabIndex={-1}>{children}</main>
        </ViewTransition>
        <Footer />
      </body>
    </html>
  );
}
