// Runnable check for the enquiry logic: `npm run check` (Node strips the types itself).
import assert from "node:assert/strict";
import { composeEnquiry, fieldError } from "./enquiry.ts";

assert.match(fieldError("name", "   ")!, /Enter your name/);
assert.equal(fieldError("name", "Ana Ruiz"), null);
assert.equal(fieldError("phone", ""), null);
assert.equal(fieldError("phone", "0414 530 836"), null);
assert.match(fieldError("phone", "12 34")!, /8 digits/);
assert.equal(fieldError("size", "2,400"), null);
assert.match(fieldError("size", "big")!, /square metres/);
assert.match(fieldError("size", "-5")!, /square metres/);

const mail = composeEnquiry("jon@maintain.com.au", {
  name: "Ana Ruiz",
  company: "Ruiz & Sons Haulage",
  phone: "",
  size: "2400",
  issues: ["Potholes and ravelling", "Dust in the dry"],
  message: "Gate approach first?",
});
assert.equal(mail.subject, "Trial area enquiry: Ruiz & Sons Haulage");
assert.equal(
  mail.body,
  "Name: Ana Ruiz\r\nCompany: Ruiz & Sons Haulage\r\nApproximate area: 2400 m²\r\nWhat is happening now: Potholes and ravelling, Dust in the dry\r\n\r\nGate approach first?",
);
// The "&" in the company name must not split the query: exactly two params, and both round-trip.
const [address, query] = mail.href.split("?");
assert.equal(address, "mailto:jon@maintain.com.au");
assert.deepEqual(query.split("&").map((p) => p.split("=")[0]), ["subject", "body"]);
assert.equal(new URLSearchParams(query).get("body"), mail.body);

console.log("enquiry checks passed");
