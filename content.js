// Amazon book page -> "search my library" buttons.
// Pure helpers (parseISBN, cleanTitle) are exported for test.js; everything
// touching the DOM lives in start().

// Amazon writes "ISBN-13 ‏ : ‎ 978-..." (with bidi marks) in Product details, and
// "ISBN-13\n978-..." (no colon) in the book-details strip at the top.
const SEP = "\\s*[\\u200E\\u200F]?\\s*:?\\s*[\\u200E\\u200F]?\\s*";
const ISBN13_RE = new RegExp(`ISBN-13${SEP}([\\d-]{13,17})`);
const ISBN10_RE = new RegExp(`ISBN-10${SEP}([\\dXx-]{10,13})`);

// Prefer ISBN-13; fall back to ISBN-10 (which may end in X).
function parseISBN(text) {
  const match = text.match(ISBN13_RE) || text.match(ISBN10_RE);
  return match ? match[1].replace(/-/g, "").toUpperCase() : null;
}

// "Dune: Deluxe Edition (Book 1)" -> "Dune". Amazon subtitles kill MAM recall.
// ponytail: naive split on ':' or '('; falls back to the full title if that leaves nothing.
function cleanTitle(title) {
  const short = (title || "").split(/[:(]/)[0].trim();
  return short || (title || "").trim();
}

// Only this book's own detail sections. Whole-page text also contains other
// books' ISBNs (compare widgets, carousels), which is what made the FCPL
// search open the wrong book.
const DETAIL_SECTIONS = "#richProductInformation_feature_div, #detailBullets_feature_div, #prodDetails, #productDetails_feature_div";
const pageISBN = () => parseISBN([...document.querySelectorAll(DETAIL_SECTIONS)].map((el) => el.innerText).join("\n"));

const SEARCHES = [
  {
    label: "Search Fairfax County Library",
    bg: "#f0c14b",
    border: "#a88734",
    url: () => {
      const isbn = pageISBN();
      return isbn && `https://fcplcat.fairfaxcounty.gov/search/searchresults.aspx?ctx=1.1033.0.0.1&type=Advanced&term=${isbn}&relation=ALL&by=ISBN&bool4=AND&limit=TOM=*&sort=RELEVANCE&page=0&searchid=2`;
    },
  },
  {
    label: "Search MAM",
    bg: "#e0c21a",
    border: "#c9a815",
    url: () => {
      const title = cleanTitle(document.querySelector("#productTitle")?.textContent);
      return title && `https://www.myanonamouse.net/tor/browse.php?tor[srchIn][title]=true&tor[text]=${encodeURIComponent(title)}`;
    },
  },
];

const CONTAINER_ID = "library-search-buttons";

function makeButton({ label, bg, border, url }) {
  const button = document.createElement("button");
  button.type = "button"; // the stack lives inside Amazon's buy form; default type would submit it
  button.textContent = label;
  Object.assign(button.style, {
    width: "100%", padding: "10px", margin: "8px 0", backgroundColor: bg,
    border: `1px solid ${border}`, borderRadius: "8px", cursor: "pointer",
    fontSize: "13px", fontWeight: "400", textAlign: "center",
  });
  // URL is built at click time, so the button can never hold a stale book's data.
  button.addEventListener("click", () => {
    const href = url();
    if (href) window.open(href, "_blank", "noopener");
  });
  return button;
}

// Make the DOM match the page: buttons present iff an ISBN is on the page.
// Idempotent, so it is safe to run on a timer.
function sync() {
  const box = document.getElementById(CONTAINER_ID);
  const wanted = Boolean(pageISBN());
  if (wanted === Boolean(box)) return;
  if (!wanted) return box.remove();
  const stack = document.querySelector("#addToCart_feature_div .a-button-stack");
  if (!stack) return;
  const div = document.createElement("div");
  div.id = CONTAINER_ID;
  div.append(...SEARCHES.map(makeButton));
  stack.append(div);
}

function start() {
  // Amazon renders product details late and swaps formats without a reload,
  // so poll instead of guessing delays. Reading the detail sections is ~1ms.
  sync();
  setInterval(sync, 500);
}

if (typeof module !== "undefined") module.exports = { parseISBN, cleanTitle };
else start();
