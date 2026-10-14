import type { Metadata } from "next";
import { RevealObserver } from "@/components/RevealObserver";
import { ButtonLink, CtaBand, FigurePanel, PageHero, Photo, i } from "@/components/ui";
import { contact, report, testimonials } from "@/content/site";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Proven as hardstand, tested on your yard: field evidence, the Eloise Copper Project reference, and the trial report that proves SuperBase on your own material.",
};

export default function TestimonialsPage() {
  return (
    <>
      <PageHero
        title={<>Proven as hardstand. <strong>Tested on your yard.</strong></>}
        lead="The binder technology behind SuperBase has been in commercial use since 2017. At the Eloise Copper Project it was applied across a whole site, including the hardstand for trucks and forklifts: concentrated wheel loads, constant turning and heavy standing, which is the same duty a plant yard asks of its surface."
        aside={
          <FigurePanel
            figure="2017"
            label="First commercial use of the binder"
            qual="The binder technology behind SuperBase. Your base material and traffic are different again, so every engagement starts with a trial area."
          />
        }
      />

      <section className="paper">
        <div className="wrap split">
          <Photo name="evidence-forklift" ratio="4x5" sizes="(max-width: 860px) 100vw, 546px" caption="Site evidence" />
          <div className="stack" data-reveal="">
            <h2 className="mp-two-tone title-1">The tyre gave up rubber before <strong>the surface gave up shape.</strong></h2>
            <p className="lead">
              <b>A 5t forklift, turning under load on a treated surface.</b> On unbound ground that turn scuffs out a hollow and
              the material moves. Here the marks sit on top of the pavement rather than in it. No test certificate required to
              read it.
            </p>
            <p className="qual">Site photograph from the SuperBase capability statement.</p>
          </div>
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          {testimonials.length > 0 ? (
            <>
              <div className="head" data-reveal=""><h2 className="title-1">What operators say</h2></div>
              <div className="quotes">
                {testimonials.map((t, k) => (
                  <figure className="quote" key={t.name} data-reveal="" style={i(k)}>
                    <blockquote><p>“{t.quote}”</p></blockquote>
                    <figcaption><b>{t.name}</b><span>{t.role}, {t.company}</span></figcaption>
                  </figure>
                ))}
              </div>
            </>
          ) : (
            <div className="option">
              <div className="callout" data-reveal="">
                <h2 className="mp-two-tone">Customer words, <strong>with permission.</strong></h2>
                <p className="note">
                  We publish what customers say only with their written approval. If you would rather hear it from a site than
                  read it here, ask Jon about reference sites.
                </p>
                <div className="btnrow">
                  <ButtonLink href={`mailto:${contact.email}?subject=${encodeURIComponent("SuperBase reference sites")}`}>Ask about reference sites</ButtonLink>
                </div>
              </div>
              <FigurePanel figure="Soaked" label="CBR, before and after" qual="On your own yard material, issued with the trial report." reveal style={i(1)} />
            </div>
          )}
        </div>
      </section>

      <section className="paper">
        <div className="wrap split top">
          <div className="stack" data-reveal="">
            <h2 className="mp-two-tone title-1">The strength gain is measured, <strong>not asserted.</strong></h2>
            <p className="lead">
              The trial area is tested by laboratory CBR on your own yard material, before treatment and after cure, so how much
              stronger the base has become is a documented figure rather than a brochure claim.
            </p>
          </div>
          <div data-reveal="" style={i(1)}>
            <p className="mp-label list-label">What the trial report gives you</p>
            <dl className="spec">{report.map((r) => <div key={r.title}><dt>{r.title}</dt><dd>{r.text}</dd></div>)}</dl>
          </div>
        </div>
      </section>

      <CtaBand />
      <RevealObserver />
    </>
  );
}
