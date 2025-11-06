document.addEventListener('DOMContentLoaded', () => {
    // Tab switching logic
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    let iconsTabInitialized = false;
    let heroTabInitialized = false;

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));
            const activeTab = document.getElementById(button.dataset.tab);
            activeTab.classList.add('active');

            if (button.dataset.tab === 'icons-tab' && !iconsTabInitialized) {
                initializeIconsTab();
                iconsTabInitialized = true;
            }
            if (button.dataset.tab === 'hero-tab' && !heroTabInitialized) {
                initializeHeroTab();
                heroTabInitialized = true;
            }
        });
    });

    // QR Code Generator Logic
    const generateQrBtn = document.getElementById('generate-qr');
    const downloadQrBtn = document.getElementById('download-qr');
    const urlInput = document.getElementById('url');
    const appNameInput = document.getElementById('appName');
    const filenameInput = document.getElementById('filename');
    const qrcodeCanvas = document.getElementById('qrcode');

    if (generateQrBtn) {
        generateQrBtn.addEventListener('click', () => {
            const url = urlInput.value;
            const appName = appNameInput.value;
            const filename = filenameInput.value;

            if (url && appName && filename) {
                const tempCanvas = document.createElement('canvas');
                QRCode.toCanvas(tempCanvas, url, { width: 300, margin: 2 }, function (error) {
                    if (error) {
                        console.error(error);
                        alert('Error generating QR code.');
                        return;
                    }

                    const padding = 20;
                    const textHeight = 60;
                    const newHeight = tempCanvas.height + textHeight + (padding * 2);

                    qrcodeCanvas.width = tempCanvas.width;
                    qrcodeCanvas.height = newHeight;

                    const ctx = qrcodeCanvas.getContext('2d');
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, qrcodeCanvas.width, qrcodeCanvas.height);
                    ctx.drawImage(tempCanvas, 0, 0);

                    ctx.fillStyle = 'black';
                    ctx.font = '16px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(appName, qrcodeCanvas.width / 2, tempCanvas.height + padding + 10);
                    ctx.font = '12px sans-serif';
                    ctx.fillText(url, qrcodeCanvas.width / 2, tempCanvas.height + padding + 30);

                    downloadQrBtn.href = qrcodeCanvas.toDataURL('image/png');
                    downloadQrBtn.download = `${filename}.png`;
                    downloadQrBtn.style.display = 'block';
                });
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    // Icon Generator Logic
    function initializeIconsTab() {
        const generateIconBtn = document.getElementById('generate-icon');
        const downloadIconBtn = document.getElementById('download-icon');
        const iconCanvas = document.getElementById('icon-canvas');
        const drawShapeSelect = document.getElementById('draw-shape');
        const drawOptionsContainer = document.getElementById('draw-options');
        const addDrawingBtn = document.getElementById('add-drawing');
        const clearDrawingsBtn = document.getElementById('clear-drawings');

        let drawings = [];

        const drawOptions = {
            line: {
                x1: { label: 'X1', type: 'number', value: 10 },
                y1: { label: 'Y1', type: 'number', value: 10 },
                x2: { label: 'X2', type: 'number', value: 100 },
                y2: { label: 'Y2', type: 'number', value: 100 },
                'stroke-color': { label: 'Color', type: 'color', value: '#ff0000' },
                'stroke-width': { label: 'Width', type: 'number', value: 5 },
            },
            rectangle: {
                x: { label: 'X', type: 'number', value: 50 },
                y: { label: 'Y', type: 'number', value: 50 },
                width: { label: 'Width', type: 'number', value: 100 },
                height: { label: 'Height', type: 'number', value: 100 },
                'fill-color': { label: 'Fill', type: 'color', value: '#0000ff' },
                'stroke-color': { label: 'Stroke', type: 'color', value: '#000000' },
                'stroke-width': { label: 'Stroke Width', type: 'number', value: 2 },
            },
            circle: {
                cx: { label: 'CX', type: 'number', value: 100 },
                cy: { label: 'CY', type: 'number', value: 100 },
                radius: { label: 'Radius', type: 'number', value: 50 },
                'fill-color': { label: 'Fill', type: 'color', value: '#00ff00' },
                'stroke-color': { label: 'Stroke', type: 'color', value: '#000000' },
                'stroke-width': { label: 'Stroke Width', type: 'number', value: 2 },
            },
            polygon: {
                points: { label: 'Points (e.g., 10,10 50,20 30,60)', type: 'text', value: '10,10 50,20 30,60' },
                'fill-color': { label: 'Fill', type: 'color', value: '#ffff00' },
                'stroke-color': { label: 'Stroke', type: 'color', value: '#000000' },
                'stroke-width': { label: 'Stroke Width', type: 'number', value: 2 },
            }
        };

        function updateDrawOptions() {
            if (!drawOptionsContainer) return;
            drawOptionsContainer.innerHTML = '';
            const selectedShape = drawShapeSelect.value;
            const options = drawOptions[selectedShape];
            for (const key in options) {
                const option = options[key];
                const div = document.createElement('div');
                div.classList.add('form-group');
                const label = document.createElement('label');
                label.textContent = option.label;
                const input = document.createElement('input');
                input.type = option.type;
                input.id = `draw-${key}`;
                input.value = option.value;
                if (option.type === 'text') input.style.width = '100%';
                div.appendChild(label);
                div.appendChild(input);
                drawOptionsContainer.appendChild(div);
            }
        }

        if (drawShapeSelect) {
            drawShapeSelect.addEventListener('change', updateDrawOptions);
        }

        if (addDrawingBtn) {
            addDrawingBtn.addEventListener('click', () => {
                const shape = { type: drawShapeSelect.value };
                const options = drawOptionsContainer.querySelectorAll('input');
                options.forEach(opt => {
                    shape[opt.id.replace('draw-', '')] = opt.type === 'number' ? Number(opt.value) : opt.value;
                });
                drawings.push(shape);
                generateIcon();
            });
        }

        if (clearDrawingsBtn) {
            clearDrawingsBtn.addEventListener('click', () => {
                drawings = [];
                generateIcon();
            });
        }

        function drawAllShapes(ctx) {
            drawings.forEach(shape => {
                if (shape.type === 'line') drawLine(ctx, shape);
                if (shape.type === 'rectangle') drawRectangle(ctx, shape);
                if (shape.type === 'circle') drawCircle(ctx, shape);
                if (shape.type === 'polygon') drawPolygon(ctx, shape);
            });
        }

        function drawLine(ctx, shape) {
            ctx.beginPath();
            ctx.moveTo(shape.x1, shape.y1);
            ctx.lineTo(shape.x2, shape.y2);
            ctx.strokeStyle = shape['stroke-color'];
            ctx.lineWidth = shape['stroke-width'];
            ctx.stroke();
        }

        function drawRectangle(ctx, shape) {
            ctx.beginPath();
            ctx.rect(shape.x, shape.y, shape.width, shape.height);
            ctx.fillStyle = shape['fill-color'];
            ctx.fill();
            ctx.strokeStyle = shape['stroke-color'];
            ctx.lineWidth = shape['stroke-width'];
            ctx.stroke();
        }

        function drawCircle(ctx, shape) {
            ctx.beginPath();
            ctx.arc(shape.cx, shape.cy, shape.radius, 0, 2 * Math.PI);
            ctx.fillStyle = shape['fill-color'];
            ctx.fill();
            ctx.strokeStyle = shape['stroke-color'];
            ctx.lineWidth = shape['stroke-width'];
            ctx.stroke();
        }

        function drawPolygon(ctx, shape) {
            const points = shape.points.split(' ').map(p => p.split(',').map(Number));
            if (points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(points[0][0], points[0][1]);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i][0], points[i][1]);
            }
            ctx.closePath();
            ctx.fillStyle = shape['fill-color'];
            ctx.fill();
            ctx.strokeStyle = shape['stroke-color'];
            ctx.lineWidth = shape['stroke-width'];
            ctx.stroke();
        }

        function generateIcon() {
            if (!iconCanvas) return;
            const shape = document.querySelector('input[name="shape"]:checked').value;
            const sizeStr = document.getElementById('icon-size').value;
            const [width, height] = sizeStr.split('x').map(Number);
            const color1 = document.getElementById('color1').value;
            const color2 = document.getElementById('color2').value;
            const text = document.getElementById('icon-text').value;
            const font = document.getElementById('icon-font').value;
            const fontSize = document.getElementById('font-size').value;
            const textColor = document.getElementById('text-color').value;
            const gravity = document.getElementById('gravity').value;

            iconCanvas.width = width;
            iconCanvas.height = height;
            const ctx = iconCanvas.getContext('2d');

            // Gradient background
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, color1);
            gradient.addColorStop(1, color2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            // Text
            ctx.fillStyle = textColor;
            ctx.font = `${fontSize}px ${font}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            let x = width / 2;
            let y = height / 2;

            if (gravity.includes('north')) y = fontSize / 2;
            if (gravity.includes('south')) y = height - fontSize / 2;
            if (gravity.includes('west')) x = fontSize / 2;
            if (gravity.includes('east')) x = width - fontSize / 2;

            ctx.fillText(text, x, y);

            // Drawings
            drawAllShapes(ctx);

            // Shape
            if (shape === 'round') {
                ctx.globalCompositeOperation = 'destination-in';
                ctx.beginPath();
                ctx.arc(width / 2, height / 2, width / 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
            }

            downloadIconBtn.href = iconCanvas.toDataURL('image/png');
            downloadIconBtn.download = `icon-${sizeStr}.png`;
            downloadIconBtn.style.display = 'block';
        }

        if (generateIconBtn) {
            generateIconBtn.addEventListener('click', generateIcon);
        }

        updateDrawOptions();
        generateIcon();
    }

    // Hero Image Editor Logic
    function initializeHeroTab() {
        const imageUpload = document.getElementById('image-upload');
        const heroCanvas = document.getElementById('hero-canvas');
        const cropTop = document.getElementById('crop-top');
        const cropBottom = document.getElementById('crop-bottom');
        const cropLeft = document.getElementById('crop-left');
        const cropRight = document.getElementById('crop-right');
        const outputWidth = document.getElementById('output-width');
        const outputHeight = document.getElementById('output-height');
        const outputFormat = document.getElementById('output-format');
        const quality = document.getElementById('quality');
        const downloadHeroBtn = document.getElementById('download-hero');
        const originalSizeInfo = document.getElementById('original-size-info');
        const generatedSizeInfo = document.getElementById('generated-size-info');

        let originalImage = null;

        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    originalImage = new Image();
                    originalImage.onload = () => {
                        originalSizeInfo.textContent = `Original size: ${originalImage.width}x${originalImage.height}`;
                        outputWidth.value = originalImage.width;
                        outputHeight.value = originalImage.height;
                        redrawHeroImage();
                    };
                    originalImage.src = event.target.result;
                };
                reader.readAsDataURL(file);
            });
        }

        function redrawHeroImage() {
            if (!originalImage || !heroCanvas) return;

            const top = parseInt(cropTop.value) || 0;
            const bottom = parseInt(cropBottom.value) || 0;
            const left = parseInt(cropLeft.value) || 0;
            const right = parseInt(cropRight.value) || 0;

            const sx = left;
            const sy = top;
            const sWidth = originalImage.width - left - right;
            const sHeight = originalImage.height - top - bottom;

            const outWidth = parseInt(outputWidth.value) || sWidth;
            const outHeight = parseInt(outputHeight.value) || sHeight;

            heroCanvas.width = outWidth;
            heroCanvas.height = outHeight;

            const heroCtx = heroCanvas.getContext('2d');
            heroCtx.drawImage(originalImage, sx, sy, sWidth, sHeight, 0, 0, outWidth, outHeight);
            updateGeneratedImageSize();
        }

        function updateGeneratedImageSize() {
            if (!heroCanvas.width || !heroCanvas.height) return;
            const format = outputFormat.value;
            const qualityValue = parseFloat(quality.value);
            const dataUrl = heroCanvas.toDataURL(format, qualityValue);
            const head = 'data:image/png;base64,';
            const sizeInBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
            const sizeInKb = (sizeInBytes / 1024).toFixed(2);
            generatedSizeInfo.textContent = `Generated size: ${sizeInKb} KB`;
        }

        [cropTop, cropBottom, cropLeft, cropRight, outputWidth, outputHeight, outputFormat, quality].forEach(input => {
            if (input) {
                input.addEventListener('input', redrawHeroImage);
            }
        });

        if (downloadHeroBtn) {
            downloadHeroBtn.addEventListener('click', () => {
                if (!originalImage) {
                    alert('Please upload an image first.');
                    return;
                }

                const format = outputFormat.value;
                const qualityValue = parseFloat(quality.value);
                const dataUrl = heroCanvas.toDataURL(format, qualityValue);

                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = `hero-image.${format.split('/')[1]}`;
                a.click();
            });
        }
    }

    // Initial setup for the default tab
    if (document.querySelector('.tab-button.active').dataset.tab === 'icons-tab') {
        initializeIconsTab();
        iconsTabInitialized = true;
    }
});