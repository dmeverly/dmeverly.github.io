(function () {
    "use strict";

    const form = document.getElementById("qr-form");
    const input = document.getElementById("qr-text");
    const clearButton = document.getElementById("qr-clear");
    const saveButton = document.getElementById("qr-save");
    const savePngButton = document.getElementById("qr-save-png");
    const preview = document.getElementById("qr-preview");
    const status = document.getElementById("qr-status");

    if (!form || !input || !clearButton || !saveButton || !savePngButton || !preview || !status) return;

    const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

    function showPlaceholder() {
        const message = document.createElement("p");
        message.className = "muted";
        message.textContent = "Your QR code will appear here.";
        preview.replaceChildren(message);
    }

    function renderQrCode(text) {
        qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

        const code = qrcode(0, "M");
        code.addData(text, "Byte");
        code.make();

        const moduleCount = code.getModuleCount();
        const quietZone = 4;
        const size = moduleCount + quietZone * 2;
        const svg = document.createElementNS(SVG_NAMESPACE, "svg");
        const background = document.createElementNS(SVG_NAMESPACE, "rect");
        const modules = document.createElementNS(SVG_NAMESPACE, "path");
        const path = [];

        svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label", "Generated QR code");
        svg.setAttribute("shape-rendering", "crispEdges");

        background.setAttribute("width", String(size));
        background.setAttribute("height", String(size));
        background.setAttribute("fill", "#fff");

        for (let row = 0; row < moduleCount; row += 1) {
            for (let column = 0; column < moduleCount; column += 1) {
                if (code.isDark(row, column)) {
                    path.push(`M${column + quietZone},${row + quietZone}h1v1h-1z`);
                }
            }
        }

        modules.setAttribute("d", path.join(""));
        modules.setAttribute("fill", "#000");
        svg.append(background, modules);
        preview.replaceChildren(svg);
        saveButton.disabled = false;
        savePngButton.disabled = false;
    }

    function clearGenerator() {
        input.value = "";
        status.textContent = "";
        saveButton.disabled = true;
        savePngButton.disabled = true;
        showPlaceholder();
        input.focus();
    }

    function downloadBlob(file, filename) {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        link.hidden = true;
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(function () {
            URL.revokeObjectURL(url);
        }, 0);
    }

    function getSvgBlob() {
        const svg = preview.querySelector("svg");
        if (!svg) return null;

        const exportSvg = svg.cloneNode(true);
        exportSvg.setAttribute("xmlns", SVG_NAMESPACE);
        exportSvg.setAttribute("width", "1024");
        exportSvg.setAttribute("height", "1024");
        const source = new XMLSerializer().serializeToString(exportSvg);
        return new Blob([source], {type: "image/svg+xml;charset=utf-8"});
    }

    function saveQrCode() {
        const file = getSvgBlob();
        if (!file) return;

        downloadBlob(file, "qrcode.svg");
        status.textContent = "QR code saved locally as qrcode.svg.";
    }

    async function saveQrCodeAsPng() {
        const svgFile = getSvgBlob();
        if (!svgFile) return;

        savePngButton.disabled = true;

        try {
            const svgUrl = URL.createObjectURL(svgFile);
            const image = new Image();
            image.src = svgUrl;

            try {
                await image.decode();
            } finally {
                URL.revokeObjectURL(svgUrl);
            }

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d", {alpha: false});
            const outputSize = 1024;

            if (!context) throw new Error("Canvas is unavailable");

            canvas.width = outputSize;
            canvas.height = outputSize;
            context.imageSmoothingEnabled = false;
            context.fillStyle = "#fff";
            context.fillRect(0, 0, outputSize, outputSize);
            context.drawImage(image, 0, 0, outputSize, outputSize);

            const pngFile = await new Promise(function (resolve, reject) {
                canvas.toBlob(function (blob) {
                    if (blob) resolve(blob);
                    else reject(new Error("PNG encoding failed"));
                }, "image/png");
            });

            downloadBlob(pngFile, "qrcode.png");
            status.textContent = "QR code saved locally as qrcode.png.";
        } catch (error) {
            status.textContent = "PNG export is not supported by this browser. You can still save the SVG.";
        } finally {
            savePngButton.disabled = !preview.querySelector("svg");
        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const text = input.value;
        if (!text) return;

        try {
            renderQrCode(text);
            status.textContent = "QR code generated locally. Nothing was uploaded or saved.";
        } catch (error) {
            showPlaceholder();
            status.textContent = "That text is too long to encode. Please shorten it and try again.";
        }
    });

    clearButton.addEventListener("click", clearGenerator);
    saveButton.addEventListener("click", saveQrCode);
    savePngButton.addEventListener("click", saveQrCodeAsPng);
    window.addEventListener("pagehide", function () {
        input.value = "";
        preview.replaceChildren();
        saveButton.disabled = true;
        savePngButton.disabled = true;
    });
}());
