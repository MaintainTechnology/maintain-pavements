// "Built, not coated" (capability statement p.3): binder on top of the layer vs through its full depth.
// The binder soaks down once, when the figure scrolls into view (globals.css › depth).
export function DepthDiagram() {
  return (
    <figure className="depth" data-reveal="">
      <svg width="0" height="0" aria-hidden="true" className="depth-defs">
        <defs>
          <pattern id="mp-aggregate" width="18" height="14" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="2.2" fill="currentColor" />
            <circle cx="13" cy="9" r="1.6" fill="currentColor" />
            <circle cx="8" cy="12.5" r="1" fill="currentColor" />
          </pattern>
          <pattern id="mp-subgrade" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="2" strokeOpacity=".16" />
          </pattern>
        </defs>
      </svg>
      <div className="depth-panels">
        <Panel kind="spray" label="A surface spray" text="Binder on top of the layer." />
        <Panel kind="superbase" label="SuperBase" text="Binder and water mixed through the full depth of the layer, then wet rolled." />
      </div>
      <figcaption className="sr-only">
        Cross-section of a yard base. A surface spray leaves the binder on top of the layer. SuperBase is mixed through the full
        scarified depth of around 75 millimetres.
      </figcaption>
    </figure>
  );
}

function Panel({ kind, label, text }: { kind: "spray" | "superbase"; label: string; text: string }) {
  const full = kind === "superbase";
  return (
    <div className={`depth-panel ${kind}`}>
      <svg viewBox="0 0 400 220" aria-hidden="true">
        <rect x="0" y="154" width="400" height="66" fill="url(#mp-subgrade)" />
        <rect className="base" x="0" y="64" width="400" height="90" fill="url(#mp-aggregate)" />
        <rect className="binder" x="0" y="64" width="400" height={full ? 90 : 7} />
        <line className="surface" x1="0" y1="64" x2="400" y2="64" />
        <text x="14" y="176">Subgrade</text>
        <text x="14" y="50">Yard base</text>
        {full && (
          <g className="dim">
            <line x1="376" y1="64" x2="376" y2="154" />
            <line x1="368" y1="64" x2="384" y2="64" />
            <line x1="368" y1="154" x2="384" y2="154" />
            <text x="362" y="114" textAnchor="end">~75 mm</text>
          </g>
        )}
      </svg>
      <p className="mp-label">{label}</p>
      <p className="note">{text}</p>
    </div>
  );
}
