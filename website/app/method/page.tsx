import type { Metadata } from "next";
import { DepthDiagram } from "@/components/DepthDiagram";
import { RevealObserver } from "@/components/RevealObserver";
import { CtaBand, FigurePanel, PageHero, Photo } from "@/components/ui";
import { report, steps } from "@/content/site";

export const metadata: Metadata = {
  title: "Method",
  description:
    "How SuperBase is built: prepare, dose and mix, grade to level, roll and compact, then cure and return to service. Soaked CBR before and after proves it.",
};

export default function MethodPage() {
  return (
    <>
      <PageHero
        title={<>The base you already have, turned into <strong>standing ground.</strong></>}
        lead="SuperBase is not a pavement, and its primary mode is not a surface spray. It is an additive introduced into the base during the lay phase and carried through every moisture process, so the binder sits through the full depth of the layer rather than on top of it."
        aside={
          <FigurePanel
            figure="~75 mm"
            label="Existing base, scarified"
            qual="Approximately. Additional roadbase is imported only where design levels require it."
          />
        }
      />

      <section className="paper">
        <div className="wrap split">
          <div className="stack" data-reveal="">
            <h2 className="mp-two-tone title-1">Mixed through the full depth. <strong>Built, not coated.</strong></h2>
            <p className="lead">
              The binder goes in with the water and is mixed through the whole layer, then wet rolled. Compaction develops the
              bond, so the surface strength comes from the layer itself.
            </p>
            <p className="mp-two-tone title-2">Grader. Water cart. Roller. <strong>No pour.</strong></p>
          </div>
          <DepthDiagram />
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <div className="head" data-reveal="">
            <h2 className="title-1">How it is built</h2>
            <p className="lead">Five steps with ordinary plant, and no paving crew.</p>
          </div>
          <ol className="steps">
            {steps.map((step) => (
              <li className="step" key={step.n} id={`step-${step.n}`}>
                <Photo name={step.image} ratio="4x3" sizes="(max-width: 860px) 100vw, 546px" caption={step.caption} n={step.n} />
                <div data-reveal="">
                  <span className="n" aria-hidden="true">{step.n}</span>
                  <h3>{step.name}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="paper">
        <div className="wrap split top">
          <div className="stack" data-reveal="">
            <h2 className="mp-two-tone title-1">Compaction builds the bond. <strong>Testing proves it.</strong></h2>
            <p className="lead">
              The strength gain is measured, not asserted. The trial area is tested by laboratory CBR on your own yard material,
              before treatment and after cure, and the result is issued with the trial report: a documented figure rather than a
              brochure claim.
            </p>
            <div>
              <p className="mp-label list-label">What the trial report gives you</p>
              <dl className="spec">{report.map((r) => <div key={r.title}><dt>{r.title}</dt><dd>{r.text}</dd></div>)}</dl>
            </div>
          </div>
          <Photo name="cbr-lab" ratio="4x3" sizes="(max-width: 860px) 100vw, 546px" caption="Soaked CBR, before and after" />
        </div>
      </section>

      <CtaBand />
      <RevealObserver />
    </>
  );
}
