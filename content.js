let checkInterval = null;

function findISBN() {
  const regex = /ISBN-(?:10|13)\s*[\u200E\u200F]?\s*:\s*[\u200E\u200F]?\s*([\d-]{10,17})/;
  const pageText = document.body.innerText;
  const match = pageText.match(regex);
  return match ? match[1].replace(/[- ]/g, "") : null;
}

function getBookTitle() {
  const titleElement = document.querySelector('#productTitle');
  return titleElement ? titleElement.textContent.trim() : null;
}

function getBookAuthor() {
  const authorElement = document.querySelector('a.a-link-normal span[data-a-popover*="contributor"]');
  return authorElement ? authorElement.textContent.trim() : null;
}

function createButton(id, text, backgroundColor, borderColor, data, action) {
  const button = document.createElement("button");
  button.id = id;
  button.textContent = text;
  button.style.width = "100%";
  button.style.padding = "10px";
  button.style.margin = "8px 0";
  button.style.backgroundColor = backgroundColor;
  button.style.border = `1px solid ${borderColor}`;
  button.style.borderRadius = "8px";
  button.style.cursor = "pointer";
  button.style.fontSize = "13px";
  button.style.fontWeight = "400";
  button.style.textAlign = "center";

  button.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: action, ...data });
  });

  return button;
}

function addLibraryButton(isbn) {
  const existingButton = document.getElementById("fairfax-library-search");
  if (existingButton) {
    existingButton.remove();
  }

  const button = createButton(
    "fairfax-library-search",
    "Search Fairfax County Library",
    "#f0c14b",
    "#a88734",
    { isbn },
    "searchLibrary"
  );

  // Try to find the button stack (contains Add to Cart and Buy Now)
  const buttonStack = document.querySelector("#addToCart_feature_div .a-button-stack");
  if (buttonStack) {
    buttonStack.appendChild(button);
  } else {
    console.error("Could not find .a-button-stack element");
  }
}

function addMAMButton() {
  const existingButton = document.getElementById("mam-library-search");
  if (existingButton) {
    existingButton.remove();
  }

  const title = getBookTitle();
  if (!title) {
    console.warn("Could not find book title for MAM search");
    return;
  }

  const author = getBookAuthor();

  const button = createButton(
    "mam-library-search",
    "Search MAM",
    "#e0c21a",
    "#c9a815",
    { title, author },
    "searchMAM"
  );

  // Try to find the button stack (contains Add to Cart and Buy Now)
  const buttonStack = document.querySelector("#addToCart_feature_div .a-button-stack");
  if (buttonStack) {
    buttonStack.appendChild(button);
  } else {
    console.error("Could not find .a-button-stack element");
  }
}

function checkAndUpdateButton() {
  const isbn = findISBN();
  if (isbn) {
    addLibraryButton(isbn);
    addMAMButton();
  } else {
    // Remove buttons if they exist and no ISBN is found
    const fcplButton = document.getElementById("fairfax-library-search");
    if (fcplButton) {
      fcplButton.remove();
    }
    const mamButton = document.getElementById("mam-library-search");
    if (mamButton) {
      mamButton.remove();
    }
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "urlChanged") {
    // Add delay to allow Amazon's page content to update before extracting ISBN
    setTimeout(() => {
      checkAndUpdateButton();
    }, 750);
  }
});

// Initial check when the script loads
checkAndUpdateButton();
