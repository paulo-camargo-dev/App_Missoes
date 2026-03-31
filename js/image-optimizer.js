const DEFAULT_OPTIONS = {
    maxWidth: 1600,
    maxHeight: 1600,
    targetKB: 300,
    minQuality: 0.5,
    initialQuality: 0.82,
    qualityStep: 0.08,
    maxResizes: 4,
    resizeFactor: 0.85,
    outputType: "image/webp"
};

function clampDimensions(width, height, maxWidth, maxHeight) {
    if (width <= maxWidth && height <= maxHeight) {
        return { width, height };
    }

    const ratio = Math.min(maxWidth / width, maxHeight / height);
    return {
        width: Math.max(1, Math.round(width * ratio)),
        height: Math.max(1, Math.round(height * ratio))
    };
}

function dataUrlToBytes(dataUrl) {
    const base64 = dataUrl.split(",")[1] || "";
    const padding = base64.endsWith("==") ? 2 : (base64.endsWith("=") ? 1 : 0);
    return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

async function loadImageFromFile(file) {
    const objectUrl = URL.createObjectURL(file);
    try {
        const img = new Image();
        img.decoding = "async";
        img.loading = "eager";
        img.src = objectUrl;

        await new Promise((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Nao foi possivel carregar a imagem."));
        });

        return img;
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

async function canvasToDataUrl(canvas, mimeType, quality) {
    if (!canvas.toBlob) {
        return canvas.toDataURL(mimeType, quality);
    }

    const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, mimeType, quality);
    });

    if (!blob) {
        return canvas.toDataURL(mimeType, quality);
    }

    return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Falha ao converter imagem."));
        reader.readAsDataURL(blob);
    });
}

export function formatKB(bytes) {
    return `${(bytes / 1024).toFixed(1)} KB`;
}

export async function compressImageToDataURL(file, customOptions = {}) {
    if (!file) {
        throw new Error("Nenhum arquivo foi enviado.");
    }

    if (!file.type || !file.type.startsWith("image/")) {
        throw new Error("Formato invalido. Envie apenas imagem.");
    }

    const options = { ...DEFAULT_OPTIONS, ...customOptions };
    const image = await loadImageFromFile(file);
    const sizeLimitBytes = options.targetKB * 1024;

    let { width, height } = clampDimensions(
        image.naturalWidth || image.width,
        image.naturalHeight || image.height,
        options.maxWidth,
        options.maxHeight
    );

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Seu navegador nao suportou compressao de imagem.");
    }

    let best = null;

    for (let resizeAttempt = 0; resizeAttempt <= options.maxResizes; resizeAttempt += 1) {
        canvas.width = width;
        canvas.height = height;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);

        for (let quality = options.initialQuality; quality >= options.minQuality; quality -= options.qualityStep) {
            const dataUrl = await canvasToDataUrl(canvas, options.outputType, quality);
            const bytes = dataUrlToBytes(dataUrl);

            if (!best || bytes < best.bytes) {
                best = { dataUrl, bytes, quality, width, height };
            }

            if (bytes <= sizeLimitBytes) {
                return {
                    dataUrl,
                    originalBytes: file.size,
                    compressedBytes: bytes,
                    width,
                    height,
                    quality
                };
            }
        }

        width = Math.max(1, Math.round(width * options.resizeFactor));
        height = Math.max(1, Math.round(height * options.resizeFactor));
    }

    return {
        dataUrl: best?.dataUrl || "",
        originalBytes: file.size,
        compressedBytes: best?.bytes || 0,
        width: best?.width || width,
        height: best?.height || height,
        quality: best?.quality || options.minQuality
    };
}
