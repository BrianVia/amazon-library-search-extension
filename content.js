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
  button.style.padding = "10px";
  button.style.margin = "10px 0";
  button.style.backgroundColor = "#f0c14b";
  button.style.border = "1px solid #a88734";
  button.style.borderRadius = "3px";
  button.style.cursor = "pointer";
  button.style.display = "block";

  button.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "searchLibrary", isbn: isbn });
  });

  const imageElement = document.querySelector("#landingImage");
  if (imageElement && imageElement.parentNode) {
    imageElement.parentNode.insertBefore(button, imageElement.nextSibling);
  } else {
    console.error("Could not find #landingImage element");
  }
}

function checkAndUpdateButton() {
  const isbn = findISBN();
  addLibraryButton(isbn);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "urlChanged") {
    checkAndUpdateButton();
  }
});

// Initial check when the script loads
checkAndUpdateButton();
