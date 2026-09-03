// node test.js
const assert = require("node:assert/strict");
const { parseISBN, cleanTitle } = require("./content.js");

// Amazon's real markup: "ISBN-10 ‎ : ‎ 0134685997" with LRM marks around the colon.
const page = "Publisher : Addison-Wesley\nISBN-10 ‎ : ‎ 013468599X\nISBN-13 ‎ : ‎ 978-0134685991\n";
assert.equal(parseISBN(page), "9780134685991", "prefers ISBN-13");
assert.equal(parseISBN("ISBN-10 : 013468599X"), "013468599X", "ISBN-10 with X check digit");
assert.equal(parseISBN("ISBN-10 : 0-13-468599-x"), "013468599X", "dashes stripped, X upcased");
assert.equal(parseISBN("ISBN-13\n978-0201616224"), "9780201616224", "book-details strip has no colon");
assert.equal(parseISBN("ASIN : B08XYZ"), null, "Kindle page has no ISBN");

assert.equal(cleanTitle("Dune: Deluxe Edition (Book 1)"), "Dune");
assert.equal(cleanTitle("1984 (Signet Classics)"), "1984");
assert.equal(cleanTitle("  Harry Potter and the Sorcerer's Stone "), "Harry Potter and the Sorcerer's Stone");
assert.equal(cleanTitle("(Untitled)"), "(Untitled)", "falls back to full title");
assert.equal(cleanTitle(undefined), "");

console.log("ok");
