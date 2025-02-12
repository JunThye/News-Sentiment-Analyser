document.getElementById("analyze").addEventListener("click", async () => {
    // Send a message to the content script to extract the news content
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript(
        {
            target: { tabId: tabs[0].id },
            func: extractNewsContent,
        },
        (results) => {
            if (results && results[0].result) {
                const newsContent = results[0].result;
  
            // Send the extracted content to your Flask server
            fetch("http://127.0.0.1:5000/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: newsContent }),
            })
                .then((response) => response.json())
                .then((data) => {
                    // Display the prediction result in the popup
                    document.getElementById("result").innerText = `Prediction: ${data.prediction}`;
                })
                .catch((error) => {
                    console.error("Error:", error);
                    document.getElementById("result").innerText = "Error occurred. Try again.";
                });
            } else {
                document.getElementById("result").innerText = "Could not extract content.";
            }
        }
        );
    });
});
  
// Function to extract article content (runs in the context of the webpage)
function extractNewsContent() {
    // Try extracting content from common article-related tags
    const articleSelectors = ["article", ".main-content", ".news-body"];
    for (const selector of articleSelectors) {
        const content = document.querySelector(selector);
        if (content) {
            console.log("Extracted Article Content:", content.innerText); // Debugging output
            return content.innerText;
        }
    }

    // Fallback: extract all visible text on the page
    console.log("Fallback Content:", document.body.innerText); // Debugging output
    return document.body.innerText;
}
  