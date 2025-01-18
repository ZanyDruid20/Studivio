document.getElementById("pdf-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const pdfFile = document.getElementById("pdf-file").files[0];
    if (!pdfFile) {
        alert("Please select a PDF file.");
        return;
    }

    // Show loading message
    document.getElementById("loading").style.display = "block";
    document.getElementById("summary-container").style.display = "none";

    const formData = new FormData();
    formData.append("pdf_file", pdfFile);

    // Send PDF to backend for processing
    fetch("/summarize_pdf", {
        method: "POST",
        body: formData
    })
    .then(response => response.text())
    .then(text => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("summary-text").textContent = text;
        document.getElementById("summary-container").style.display = "block";
    })
    .catch(error => {
        document.getElementById("loading").style.display = "none";
        alert("Error: " + error.message);
        console.error(error);
    });
});