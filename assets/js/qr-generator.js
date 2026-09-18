(function () {
    "use strict";

    const form = document.getElementById("qr-form");
    const input = document.getElementById("qr-text");
    const clearButton = document.getElementById("qr-clear");
    const saveButton = document.getElementById("qr-save");
    const savePngButton = document.getElementById("qr-save-png");
    const preview = document.getElementById("qr-preview");
    const status = document.getElementById("qr-status");
    const count = document.getElementById("qr-count");

    if (!form || !input || !clearButton || !saveButton || !savePngButton || !preview || !status || !count) return;

    const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
    const RENDER_DELAY_MS = 150;
    let renderTimer;

    function showPlaceholder() {
        const message = document.createElement("p");
        message.className = "muted";
        message.textContent = "Your QR code will appear here as you type.";
        preview.replaceChildren(message);
    }

    function setStatus(message, kind) {
        status.textContent = message;
        status.dataset.kind = kind || "";
    }

    function updateCount() {
        count.textContent = `${input.value.length} of ${input.maxLength} characters`;
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
        window.clearTimeout(renderTimer);
        input.value = "";
        setStatus("");
        updateCount();
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
        setStatus("Saved qrcode.svg to your downloads folder.", "success");
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
            setStatus("Saved qrcode.png to your downloads folder.", "success");
        } catch (error) {
            setStatus("Your browser can't create a PNG. Download the SVG instead.", "error");
        } finally {
            savePngButton.disabled = !preview.querySelector("svg");
        }
    }

    function updateQrCode() {
        const text = input.value;
        setStatus("");

        if (!text) {
            saveButton.disabled = true;
            savePngButton.disabled = true;
            showPlaceholder();
            return;
        }

        try {
            renderQrCode(text);
        } catch (error) {
            saveButton.disabled = true;
            savePngButton.disabled = true;
            showPlaceholder();
            setStatus("That is too much text to fit in one QR code. Please shorten it.", "error");
        }
    }

    input.addEventListener("input", function () {
        updateCount();
        window.clearTimeout(renderTimer);
        renderTimer = window.setTimeout(updateQrCode, RENDER_DELAY_MS);
    });

    clearButton.addEventListener("click", clearGenerator);
    saveButton.addEventListener("click", saveQrCode);
    savePngButton.addEventListener("click", saveQrCodeAsPng);
    window.addEventListener("pagehide", function () {
        window.clearTimeout(renderTimer);
        input.value = "";
        updateCount();
        preview.replaceChildren();
        saveButton.disabled = true;
        savePngButton.disabled = true;
    });
}());
