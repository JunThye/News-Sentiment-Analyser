chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractContent") {
      // Extract the headline (H1 element) from the current page
      const headline = document.querySelector("h1")?.innerText || "No headline found";

      // Extract the article content (all <p> tags inside the main content area)
      const paragraphs = Array.from(document.querySelectorAll("p"))
        .map(p => p.innerText) // Get the text content of each <p> tag
        .filter(text => text.trim().length > 0) // Filter out empty paragraphs
        .join("\n\n"); // Join paragraphs with double line breaks for readability

        // Send the response back with the headline and full article content
        sendResponse({
            headline: headline,
            content: paragraphs || "No content found"
        });
    }
  });
  