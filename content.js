let checkInterval = null;

function findISBN() {
  const regex = /ISBN-(?:10|13)\s*[\u200E\u200F]?\s*:\s*[\u200E\u200F]?\s*([\d-]{10,17})/;
  const pageText = document.body.innerText;
  const match = pageText.match(regex);
  return match ? match[1].replace(/[- ]/g, "") : null;
}

function addLibraryButton(isbn) {
  const existingButton = document.getElementById("fairfax-library-search");
  if (existingButton) {
    existingButton.remove();
  }

  const button = document.createElement("button");
  button.id = "fairfax-library-search";
  button.textContent = "Search Fairfax County Library";
  button.style.width = "100%";
  button.style.padding = "10px";
  button.style.margin = "8px 0";
  button.style.backgroundColor = "#f0c14b";
  button.style.border = "1px solid #a88734";
  button.style.borderRadius = "8px";
  button.style.cursor = "pointer";
  button.style.fontSize = "13px";
  button.style.fontWeight = "400";
  button.style.textAlign = "center";

  button.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "searchLibrary", isbn: isbn });
  });

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
  } else {
    // Remove button if it exists and no ISBN is found
    const existingButton = document.getElementById("fairfax-library-search");
    if (existingButton) {
      existingButton.remove();
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
