import * as pdfjsLib from "../vendor/pdfjs/pdf.min.mjs";

const pdfUrl = new URL("../David_Everly_SWE_CRNP.pdf", import.meta.url).href;
const pdf = document.getElementById("cvPdf");
const loader = document.getElementById("cvLoading");

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("../vendor/pdfjs/pdf.worker.min.mjs", import.meta.url).href;

function showFallback() {
    const message = document.createElement("span");
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Open the PDF directly";
    message.append("Unable to display the CV. ", link, ".");
    loader.replaceChildren(message);
}

try {
    const documentPdf = await pdfjsLib.getDocument({ url: pdfUrl, isEvalSupported: false }).promise;

    for (let pageNumber = 1; pageNumber <= documentPdf.numPages; pageNumber += 1) {
        const page = await documentPdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.setAttribute("aria-label", `CV page ${pageNumber}`);
        await page.render({ canvasContext: context, viewport }).promise;
        pdf.appendChild(canvas);
    }

    loader.style.display = "none";
} catch (error) {
    showFallback();
    console.error("Unable to render the CV PDF:", error);
}
