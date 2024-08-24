chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "searchLibrary") {
    const librarySearchUrl = `https://fcplcat.fairfaxcounty.gov/search/searchresults.aspx?ctx=1.1033.0.0.1&type=Advanced&term=${request.isbn}&relation=ALL&by=ISBN&bool4=AND&limit=TOM=*&sort=RELEVANCE&page=0&searchid=2`;
    chrome.tabs.create({ url: librarySearchUrl });
  }
});
