// All site copy, taken from Jon Pepper's SuperBase capability statement (Sept 2026, 7 pp.).
// Say nothing stronger than that document: the approved wording and the must-not-say list
// live in MaintainPavements/01 Jon's Plan/Claims Register.md. Text only; images are in ./images.ts.
import type { ImageKey } from "./images";

export const contact = {
  person: "Jon Pepper",
  phone: "0414 530 836",
  phoneHref: "tel:+61414530836",
  email: "jon@maintain.com.au",
  web: "maintain.com.au",
  webHref: "https://maintain.com.au",
};

export const nav = [
  { href: "/pavements", label: "Pavements" },
  { href: "/method", label: "Method" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Travels with every figure (DESIGN.md › Do's). */
export const qualifier = "Indicative. Varies with base material, climate and duty. Confirmed by site trial.";

/** Verbatim from the capability statement, p.7. */
export const disclaimer =
  "Figures shown are indicative only and are not an offer or a guarantee of performance or saving. Unit rates, dosage, depth, cure times, CBR results and savings vary with base material, climate and surface duty, and are confirmed by site trial and material testing before any commitment. Comparative pricing is against engineered concrete hardstand construction. SuperBase is not a substitute for engineered ground assessment, and where plant imposes critical loads those remain to be assessed against tested figures for the specific area.";

export const cycle = [
  { lead: "Potholes and ravelling", text: "that start small, take water, and then open up fast under traffic." },
  { lead: "Rutting and pumping", text: "where plant stands and turns, so the same areas need making good again and again." },
  { lead: "Recurring grader and patching hours", text: "that never actually finish the job." },
  { lead: "Loose stone", text: "chewing tyres, and out-of-level ground where plant has to stand." },
  { lead: "Mud in the wet:", text: "the yard slows down or stops, and it gets tracked onto the public road at the gate." },
  { lead: "Dust in the dry,", text: "across an area where people are working on the ground." },
  { lead: "Downtime", text: "every time an area has to come out of service to be repaired." },
];

export const concrete = [
  { lead: "Capital cost.", text: "Engineered concrete hardstand carries a rate that is hard to justify across a whole yard." },
  { lead: "The yard stops.", text: "Formwork, pour and strength gain take the area out of service for weeks." },
  { lead: "It is fixed.", text: "Change the yard layout and the slab is in the wrong place." },
  { lead: "Point loads still crack it.", text: "Repair then means saw-cutting, breaking out and disposal." },
  { lead: "Minimum quantities", text: "make treating one or two areas uneconomic." },
];

export const steps: { n: string; name: string; short: string; text: string; caption: string; image: ImageKey }[] = [
  {
    n: "01",
    name: "Prepare",
    short: "Loose stone graded off; the existing base scarified to around 75 mm.",
    text: "Loose stone and bull dust are graded off and the existing yard base is scarified to approximately 75 mm. Additional roadbase is imported only where design levels require it. Usually the material already in the yard is all that is needed.",
    caption: "Trimming the scarified base",
    image: "step-01-prepare",
  },
  {
    n: "02",
    name: "Dose and mix",
    short: "Binder and water, mixed through the full depth of the layer.",
    text: "SuperBase is introduced with water at a binder-to-water ratio set against your own base material, and mixed through the full depth of the layer. Where new base has been added, the binder runs through all moisture processes so the new layer does not delaminate from the old.",
    caption: "Binder and water through the full depth",
    image: "step-02-dose-mix",
  },
  {
    n: "03",
    name: "Grade to level",
    short: "Trimmed to design level and crossfall while still workable.",
    text: "The treated base is trimmed to design level and crossfall while it is still workable. Getting fall right at this stage is what stops water ponding later, and ponded water is where potholes start.",
    caption: "Trimmed to level and crossfall",
    image: "step-03-grade",
  },
  {
    n: "04",
    name: "Roll and compact",
    short: "Wet rolled to final compaction. Built, not coated.",
    text: "Wet rolling to final compaction with a smooth drum roller. This is the stage that develops the bond: the surface is built, not coated, and it is where the surface strength comes from. Compaction is confirmed on site against the density nominated in the dosage design.",
    caption: "Wet rolling to final compaction",
    image: "step-04-roll",
  },
  {
    n: "05",
    name: "Cure and return to service",
    short: "Trafficable within hours of the final roll.",
    text: "The surface cures to a bound, hard-wearing hardstand and is trafficable within hours of the final roll, against the weeks a concrete pad needs to reach working strength. High-wear running lines can take an organic top coat, a sprayed dressing over the compacted base.",
    caption: "Cured and back in service",
    image: "step-05-cure",
  },
];

export const report = [
  { title: "Soaked CBR", text: "Before treatment and after cure, on your own yard material. Tested soaked, because that is the condition a yard fails in." },
  { title: "Depth & compaction", text: "The treated depth and the density achieved across the trial area, measured on site." },
  { title: "Dosage rate", text: "The binder rate that produced the result, so roll-out is priced and specified off a known number." },
];

export const areas: { id: string; name: string; dose: string; applied: string; outcome: string; image: ImageKey }[] = [
  {
    id: "heavy-plant",
    name: "Heavy plant standing areas",
    dose: "Full mixed-through",
    applied: "Re-levelled and scarified through the existing base, with binder and water applied across all processes through to final wet roll.",
    outcome: "A hard, level standing area that holds its shape under concentrated loads.",
    image: "area-heavy-plant",
  },
  {
    id: "stockpile",
    name: "Stockpile & bulk material aprons",
    dose: "Full mixed-through",
    applied: "Full mixed-through treatment, dosed for repeated loader passes and sustained stockpile loading.",
    outcome: "Aprons that hold their shape under loaders instead of pushing out and rutting.",
    image: "area-stockpile",
  },
  {
    id: "laydown",
    name: "Product & equipment laydown",
    dose: "Full mixed-through",
    applied: "Full mixed-through treatment to carry concentrated static loads over long periods.",
    outcome: "Stable standing for stacked product and stored plant without bedding in.",
    image: "area-laydown",
  },
  {
    id: "access-lanes",
    name: "Internal access & turning lanes",
    dose: "Initial dosage + top coat",
    applied: "Initial dosage mixed through the base, with an organic top coat over high-wear running lines.",
    outcome: "A running surface that holds level under multi-axle turning instead of corrugating.",
    image: "area-access-lanes",
  },
  {
    id: "marshalling",
    name: "Trailer marshalling & load-out",
    dose: "Lighter dosage",
    applied: "As for access and turning lanes, at a lighter dosage rate.",
    outcome: "A marshalling area that stays trafficable through wet weather.",
    image: "area-marshalling",
  },
  {
    id: "gate",
    name: "Gate approaches & perimeter",
    dose: "Lighter dosage, by water cart",
    applied: "Lighter dosage applied by water cart as part of routine yard watering.",
    outcome: "Less dust in the dry and less mud tracked onto the public road.",
    image: "area-gate",
  },
];

/** The three ways to hold a yard. Cells marked * carry the qualifier in the table caption. */
export const options = ["Keep making it good", "Pour a slab", "SuperBase"];
export const compare = [
  { row: "The work", cells: ["Grade and patch, again and again", "Engineered concrete: formwork and a pour", "A grader, water cart and roller binding the base you already have"] },
  { row: "Out of service", cells: ["Every time an area has to be repaired", "Weeks, while the slab reaches working strength", "Trafficable within hours of the final roll*"] },
  { row: "Cost", cells: ["Recurring grader and patching hours", "A rate that is hard to justify across a whole yard", "Indicatively 60–70% below engineered concrete*"] },
  { row: "Scope", cells: ["Never actually finishes the job", "Minimum quantities make one or two areas uneconomic", "Area by area, staged so the yard keeps trading"] },
];

export const faqs = [
  {
    q: "Is SuperBase a surface spray?",
    a: "No. SuperBase is not a pavement, and its primary mode is not a surface spray. It is an additive introduced into the base during the lay phase and carried through every moisture process, so the binder sits through the full depth of the layer rather than on top of it.",
  },
  {
    q: "Do we need to import new material?",
    a: "Usually not. Additional roadbase is imported only where design levels require it; usually the material already in the yard is all that is needed.",
  },
  {
    q: "What plant does it take?",
    a: "A grader, water cart and roller, with no paving crew and no pour. After handover, your own crew and plant run it as routine work.",
  },
  {
    q: "How soon can we use the area again?",
    a: "The surface is trafficable within hours of the final roll, against the weeks a concrete pad needs to reach working strength. Cure times vary with base material, climate and duty.",
  },
  {
    q: "How do we know it has worked?",
    a: "The trial area is tested by laboratory CBR on your own yard material, before treatment and after cure. The trial report gives the soaked CBR result, the treated depth and density achieved, and the dosage rate that produced it.",
  },
  {
    q: "How does the cost compare with concrete?",
    a: "Indicatively, the unit rate lands 60–70% below engineered concrete hardstand. Rates vary with base material, climate and duty, and are confirmed by site trial and material testing before any commitment.",
  },
  {
    q: "Does it replace an engineering assessment?",
    a: "No. SuperBase is not a substitute for engineered ground assessment. Where plant imposes critical loads, those remain to be assessed against tested figures for the specific area.",
  },
];

export const provides = [
  { lead: "Supply and logistics", text: "to your yard." },
  { lead: "Dosage design", text: "for your actual base material, not a generic rate card." },
  { lead: "CBR testing", text: "before and after, issued as a trial report." },
  { lead: "Application methodology", text: "and method statements for approval." },
  { lead: "On-site supervision", text: "for the first application." },
  { lead: "Crew training", text: "so your own operators run it from then on." },
];

export const start = [
  { n: "01", title: "Yard walk", text: "Review the areas, the base material and what the current surface is costing to hold each year." },
  { n: "02", title: "Trial area", text: "Nominate one representative area and treat it." },
  { n: "03", title: "Test and report", text: "CBR before and after, with dosage and depth confirmed." },
  { n: "04", title: "Roll out by area", text: "Staged so the yard keeps trading." },
  { n: "05", title: "Handover", text: "Your crew and your plant, running it as routine work." },
];

export const principles = [
  { title: "Use the base you have", text: "Usually the material already in the yard is all that is needed. New roadbase comes in only where design levels require it." },
  { title: "Built, not coated", text: "The binder sits through the full depth of the layer rather than on top of it, and compaction develops the bond." },
  { title: "Ordinary plant", text: "A grader, water cart and roller. No paving crew and no pour." },
  { title: "Measured, not asserted", text: "Soaked CBR before and after, on your own yard material, issued as a documented figure rather than a brochure claim." },
  { title: "Area by area", text: "Start with one trial area, then roll out in stages so the yard keeps trading." },
  { title: "Your crew runs it", text: "Training and supervision for the first application, then your operators run it as routine work." },
];

/** The maintenance cycle, as checkboxes on the enquiry form. */
export const enquiryIssues = ["Potholes and ravelling", "Rutting and pumping", "Loose stone", "Mud in the wet", "Dust in the dry", "Downtime for repairs"];

export type Testimonial = { quote: string; name: string; role: string; company: string };
/** Real customer statements only, each with written approval to publish. An empty list shows the reference-site invitation instead. */
export const testimonials: Testimonial[] = [];
