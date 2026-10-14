import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { RevealObserver } from "@/components/RevealObserver";
import { ButtonLink, CtaBand, FigurePanel, Icon, Photo, i } from "@/components/ui";
import { images } from "@/content/images";
import { areas, qualifier, steps } from "@/content/site";

/** Splits a phrase into words the cover can stagger in, keeping real spaces for wrapping and reading. */
function Words({ text, from = 0 }: { text: string; from?: number }) {
  return text.split(" ").map((word, k) => (
    <Fragment key={k}>
      {k > 0 && " "}
      <span className="w" style={i(from + k)}>{word}</span>
    </Fragment>
  ));
}

export default function Home() {
  const hero = images["hero-yard"];
  return (
    <>
      <section className="dark hero">
        <div className="hero-media">
          <Image src={hero.src} alt={hero.alt} fill sizes="100vw" placeholder="blur" loading="eager" fetchPriority="high" />
        </div>
        <div className="wrap">
          <h1 className="mp-two-tone">
            <Words text="Stop patching the yard." /> <strong><Words text="Bind it." from={4} /></strong>
          </h1>
          <p className="lead enter" style={i(0)}>
            SuperBase is a bonding agent dosed into the yard base you already have. It is mixed through with water, graded to
            level, then rolled and compacted into a hard, bound hardstand, built with a grader, water cart and roller, with no
            paving crew and no pour.
          </p>
          <div className="btnrow enter" style={i(1)}>
            <ButtonLink href="/contact">Nominate a trial area</ButtonLink>
            <ButtonLink href="/method" variant="ghost">See how it is built</ButtonLink>
          </div>
          <div className="mp-laneline lane" aria-hidden="true" />
          <dl className="specs enter" style={i(2)}>
            <div><dt>No pour</dt><dd>Grader, water cart and roller. No paving crew.</dd></div>
            <div><dt>Within hours</dt><dd>Trafficable after the final roll.*</dd></div>
            <div><dt>Soaked CBR</dt><dd>Tested before and after, on your own material.</dd></div>
            <div><dt>60–70%</dt><dd>Below engineered concrete hardstand.*</dd></div>
          </dl>
          <p className="qual enter" style={i(3)}>*{qualifier} Cure times vary by site.</p>
        </div>
      </section>

      <section className="paper">
        <div className="wrap split">
          <div className="stack" data-reveal="">
            <h2 className="mp-two-tone title-1">The yard never actually <strong>gets finished.</strong></h2>
            <p className="lead">
              Form a yard up and it starts going backwards the same month. Heavy plant concentrates load onto small footprints in
              the same places, water gets into the base, and what was a level pad becomes ruts, potholes and loose stone. So the
              grader comes back. And comes back again.
            </p>
            <p><Link className="textlink" href="/pavements">Why patching and concrete both stall <Icon name="arrow" /></Link></p>
          </div>
          <Photo name="problem-yard" ratio="4x3" sizes="(max-width: 860px) 100vw, 546px" caption="An untreated yard, the starting point for most sites" />
        </div>
      </section>

      <section className="dark">
        <div className="wrap option">
          <div className="callout" data-reveal="">
            <h2 className="mp-two-tone">
              The choice is usually “keep making it good” or “pour a slab”. <strong>There is a third option.</strong>
            </h2>
            <p className="note">
              SuperBase builds a bound hardstand out of the base already in your yard, area by area, without a pour, and without
              the patching cycle that follows.
            </p>
            <div className="btnrow"><ButtonLink href="/pavements" variant="ghost">Compare the three</ButtonLink></div>
          </div>
          <FigurePanel figure="60–70%" label="Below engineered concrete" reveal style={i(1)} />
        </div>
      </section>

      <section className="paper">
        <div className="wrap">
          <div className="head" data-reveal="">
            <h2 className="mp-two-tone title-1">The base you already have, turned into <strong>standing ground.</strong></h2>
            <p className="lead">
              SuperBase is not a pavement, and its primary mode is not a surface spray. It goes in during the lay phase, so the
              binder sits through the full depth of the layer rather than on top of it.
            </p>
          </div>
          <div className="mp-laneline lane-rule" data-reveal="" aria-hidden="true" />
          <ol className="sequence">
            {steps.map((step, k) => (
              <li key={step.n} data-reveal="" style={i(k)}>
                <span className="n" aria-hidden="true">{step.n}</span>
                <h3>{step.name}</h3>
                <p>{step.short}</p>
              </li>
            ))}
          </ol>
          <p className="more" data-reveal=""><Link className="textlink" href="/method">The full method <Icon name="arrow" /></Link></p>
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <div className="head" data-reveal="">
            <h2 className="mp-two-tone title-1">One product, dosed to suit <strong>what each area carries.</strong></h2>
            <p className="lead">
              The same binder is applied at different rates depending on the duty of the area: a full mixed-through treatment
              where heavy plant stands, a lighter dosage where trailers marshal and pass.
            </p>
          </div>
        </div>
        <ul className="rail" aria-label="Yard areas">
          {areas.map((area, k) => (
            <li key={area.id} data-reveal="" style={i(k)}>
              <Link href={`/pavements#${area.id}`} className="tile">
                <Photo name={area.image} ratio="4x5" sizes="288px" caption={area.dose} reveal={false} />
                <h3>{area.name}</h3>
                <p>{area.outcome}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="paper">
        <div className="wrap split">
          <Photo name="evidence-forklift" ratio="4x5" sizes="(max-width: 860px) 100vw, 546px" caption="Site evidence · 5t forklift turn" />
          <div className="stack" data-reveal="">
            <h2 className="mp-two-tone title-1">Proven as hardstand. <strong>Tested on your yard.</strong></h2>
            <p className="lead">
              The binder technology behind SuperBase has been in commercial use since 2017, including truck and forklift hardstand
              at the Eloise Copper Project. Your base material and traffic are different again, so every engagement starts with a
              trial area and CBR testing rather than a claim.
            </p>
            <p><Link className="textlink" href="/testimonials">See the evidence <Icon name="arrow" /></Link></p>
          </div>
        </div>
      </section>

      <CtaBand />
      <RevealObserver />
    </>
  );
}
