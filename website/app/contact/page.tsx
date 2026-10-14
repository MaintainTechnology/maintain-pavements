import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { RevealObserver } from "@/components/RevealObserver";
import { ContactCard, Icon, PageHero } from "@/components/ui";
import { contact, faqs, start } from "@/content/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Nominate one area for a SuperBase trial, or book a yard walk with Jon Pepper on 0414 530 836 or jon@maintain.com.au.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title={<>Nominate <strong>one area.</strong></>}
        lead="We will treat it, test it, and put the numbers beside a concrete quote and a year of patching. A trial area tests the surface, the strength figure and the business case at the same time, on your material, in your yard."
        aside={<ContactCard />}
      />

      <section className="paper">
        <div className="wrap contact-grid">
          <div className="stack" data-reveal="">
            <h2 className="title-2">Tell us about the yard</h2>
            <p className="body">
              This form writes the email for you: your email app opens with it ready to send to Jon. Rather talk it through? Call{" "}
              <a href={contact.phoneHref}>{contact.phone}</a>.
            </p>
            <div>
              <p className="mp-label list-label">What happens next</p>
              <ol className="next">
                {start.map((s) => (
                  <li key={s.n}><span className="n" aria-hidden="true">{s.n}</span><span><b>{s.title}.</b> {s.text}</span></li>
                ))}
              </ol>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="dark">
        <div className="wrap split top">
          <div className="stack" data-reveal="">
            <h2 className="title-1">Before you call</h2>
            <p className="lead">Straight answers, in the same terms as the capability statement.</p>
          </div>
          <div className="faq" data-reveal="">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}<Icon name="plus" /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <RevealObserver />
    </>
  );
}
