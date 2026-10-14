import type { Metadata } from "next";
import { ButtonLink, i } from "@/components/ui";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="dark page-hero not-found">
      <div className="wrap">
        <div>
          <h1 className="mp-two-tone enter">This ground <strong>isn’t built yet.</strong></h1>
          <p className="lead enter" style={i(1)}>The page you asked for doesn’t exist or has moved. Head back to solid ground.</p>
          <div className="btnrow enter" style={i(2)}>
            <ButtonLink href="/">Back to home</ButtonLink>
            <ButtonLink href="/contact" variant="ghost">Contact Jon</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
