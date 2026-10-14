import type { Metadata } from "next";
import { RevealObserver } from "@/components/RevealObserver";
import { ButtonLink, CtaBand, FigurePanel, PageHero, Photo, i } from "@/components/ui";
import { areas, compare, concrete, cycle, options, qualifier } from "@/content/site";

export const metadata: Metadata = {
  title: "Pavements",
  description:
    "Bound hardstand from the base already in your yard: how SuperBase compares with patching and with concrete, and how it is dosed for each yard area.",
};

export default function PavementsPage() {
  return (
    <>
      <PageHero
        title={<>Keep making it good, pour a slab, <strong>or bind it.</strong></>}
        lead="SuperBase builds a bound hardstand out of the base already in your yard, area by area, without a pour, and without the patching cycle that follows."
        aside={<FigurePanel figure="60–70%" label="Below engineered concrete" />}
      >
        <div className="btnrow"><ButtonLink href="/contact">Nominate a trial area</ButtonLink></div>
      </PageHero>

      <section className="paper">
        <div className="wrap">
          <div className="head" data-reveal="">
            <h2 className="mp-two-tone title-1">The yard never actually <strong>gets finished.</strong></h2>
            <p className="lead">
              Heavy plant concentrates load onto small footprints in the same places, water gets into the base, and a level pad
              becomes ruts, potholes and loose stone. The usual answers are to keep making it good, or to pour a slab.
            </p>
          </div>
          <div className="two-ways">
            <div className="way" data-reveal="">
              <Photo name="problem-yard" ratio="3x2" sizes="(max-width: 860px) 100vw, 514px" reveal={false} />
              <h3 className="title-2">Keep making it good</h3>
              <div>
                <p className="mp-label list-label">The cycle you keep paying for</p>
                <ol className="cycle">{cycle.map((c) => <li key={c.lead}><span><b>{c.lead}</b> {c.text}</span></li>)}</ol>
              </div>
            </div>
            <div className="way" data-reveal="" style={i(1)}>
              <Photo name="concrete-pour" ratio="3x2" sizes="(max-width: 860px) 100vw, 514px" reveal={false} />
              <h3 className="title-2">Pour a slab</h3>
              <div>
                <p className="mp-label list-label">Why concrete stalls</p>
                <ol className="cycle">{concrete.map((c) => <li key={c.lead}><span><b>{c.lead}</b> {c.text}</span></li>)}</ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <div className="head" data-reveal="">
            <h2 className="mp-two-tone title-1">There is a <strong>third option.</strong></h2>
            <p className="lead">The same yard, held three ways.</p>
          </div>
          <div className="table-scroll" role="region" aria-label="The three options compared" tabIndex={0} data-reveal="">
            <table className="compare">
              <caption>*{qualifier} Cure times vary by site. Comparative pricing is against engineered concrete hardstand construction.</caption>
              <thead>
                <tr>
                  <td />
                  {options.map((o) => <th key={o} scope="col">{o}</th>)}
                </tr>
              </thead>
              <tbody>
                {compare.map((r) => (
                  <tr key={r.row}>
                    <th scope="row">{r.row}</th>
                    {r.cells.map((c, k) => <td key={k}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="paper" id="areas">
        <div className="wrap">
          <div className="head" data-reveal="">
            <h2 className="mp-two-tone title-1">One product, dosed to suit <strong>what each area carries.</strong></h2>
            <p className="lead">
              The same binder is applied at different rates depending on the duty of the area: a full mixed-through treatment
              where heavy plant stands, a lighter dosage where trailers marshal and pass.
            </p>
          </div>
          <div className="areas">
            {areas.map((area, k) => (
              <article className="area" id={area.id} key={area.id} data-reveal="" style={i(k % 2)}>
                <Photo name={area.image} ratio="4x5" sizes="(max-width: 480px) 260px, 200px" reveal={false} />
                <div>
                  <span className="chip">{area.dose}</span>
                  <h3>{area.name}</h3>
                  <dl>
                    <div><dt>How it is applied</dt><dd>{area.applied}</dd></div>
                    <div><dt>Outcome</dt><dd>{area.outcome}</dd></div>
                  </dl>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
      <RevealObserver />
    </>
  );
}
