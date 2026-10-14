import type { Metadata } from "next";
import { RevealObserver } from "@/components/RevealObserver";
import { CtaBand, Icon, PageHero, Photo, i } from "@/components/ui";
import { principles, provides, start } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Maintain Pavements, the Maintain group's hardstand and industrial surfaces business: SuperBase supply, dosage design, CBR testing, supervision and crew training.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title={<>From one trial area <strong>to the whole yard.</strong></>}
        lead="Maintain Pavements is the hardstand and industrial surfaces business of the Maintain group. We supply SuperBase, design the dosage for your actual base material, prove it on a trial area, and train your crew to run it as routine work."
        aside={<Photo name="yard-walk" ratio="3x2" sizes="(max-width: 860px) 100vw, 480px" caption="Yard walk" n="01" eager reveal={false} className="enter" />}
      />

      <section className="paper">
        <div className="wrap split top">
          <div className="stack" data-reveal="">
            <h2 className="title-1">What Maintain Pavements provides</h2>
            <p className="lead">From the first trial area through to handover.</p>
          </div>
          <ul className="ticks">
            {provides.map((p, k) => (
              <li key={p.lead} data-reveal="" style={i(k)}>
                <Icon name="check" />
                <span><b>{p.lead}</b> {p.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <div className="head" data-reveal="">
            <h2 className="title-1">How we start</h2>
            <p className="lead">One representative area first, then the rest of the yard in stages, so it keeps trading.</p>
          </div>
          <div className="mp-laneline lane-rule" data-reveal="" aria-hidden="true" />
          <ol className="sequence">
            {start.map((s, k) => (
              <li key={s.n} data-reveal="" style={i(k)}>
                <span className="n" aria-hidden="true">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="paper">
        <div className="wrap split top">
          <div className="stack" data-reveal="">
            <h2 className="mp-two-tone title-1">Measured, <strong>not asserted.</strong></h2>
            <p className="lead">The ideas the method is built on.</p>
          </div>
          <dl className="spec" data-reveal="" style={i(1)}>
            {principles.map((p) => <div key={p.title}><dt>{p.title}</dt><dd>{p.text}</dd></div>)}
          </dl>
        </div>
      </section>

      <CtaBand />
      <RevealObserver />
    </>
  );
}
