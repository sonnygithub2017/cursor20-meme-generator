// Global state
let currentImage = null;
let textBoxes = [];
let activeTextBox = null;
let textBoxIdCounter = 0;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// DOM elements
const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const textBoxContainer = document.getElementById('textBoxContainer');
const textInput = document.getElementById('textInput');
const addTextBtn = document.getElementById('addTextBtn');
const fontSizeSlider = document.getElementById('fontSizeSlider');
const fontSizeInput = document.getElementById('fontSizeInput');
const downloadBtn = document.getElementById('downloadBtn');

// Load image from file or URL
function loadImage(source) {
    const img = new Image();
    img.onload = function() {
        currentImage = img;

        // Set canvas dimensions to match image
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        // Scale down if image is too large
        if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            width = width * scale;
            height = height * scale;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Update text box container size
        textBoxContainer.style.width = width + 'px';
        textBoxContainer.style.height = height + 'px';

        // Clear existing text boxes
        textBoxes.forEach(tb => tb.element.remove());
        textBoxes = [];
        activeTextBox = null;

        // Enable download button
        downloadBtn.disabled = false;
    };
    img.src = source;
}

// Image upload handler
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Clear active template selection
    document.querySelectorAll('.template-item').forEach(item => {
        item.classList.remove('active');
    });

    const reader = new FileReader();
    reader.onload = function(e) {
        loadImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Template selection handler
function handleTemplateSelect(templatePath) {
    loadImage(templatePath);

    // Remove active class from all templates
    document.querySelectorAll('.template-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to selected template
    const selectedTemplate = document.querySelector(`[data-template="${templatePath}"]`);
    if (selectedTemplate) {
        selectedTemplate.classList.add('active');
    }
}

// Add text box
function addTextBox() {
    const text = textInput.value.trim();
    if (!text || !currentImage) return;

    const textBox = document.createElement('div');
    textBox.className = 'text-box';
    textBox.id = `textbox-${textBoxIdCounter++}`;

    const textContent = document.createElement('div');
    textContent.className = 'text-box-content';
    textContent.textContent = text;

    // Set initial font size
    const fontSize = parseInt(fontSizeSlider.value);
    textContent.style.fontSize = fontSize + 'px';

    textBox.appendChild(textContent);
    textBoxContainer.appendChild(textBox);

    // Center the text box initially
    const containerRect = textBoxContainer.getBoundingClientRect();
    const textBoxRect = textBox.getBoundingClientRect();
    textBox.style.left = (containerRect.width / 2 - textBoxRect.width / 2) + 'px';
    textBox.style.top = (containerRect.height / 2 - textBoxRect.height / 2) + 'px';

    // Store text box data
    const textBoxData = {
        element: textBox,
        content: textContent,
        text: text,
        fontSize: fontSize,
        x: parseFloat(textBox.style.left) || 0,
        y: parseFloat(textBox.style.top) || 0
    };

    textBoxes.push(textBoxData);

    // Make it active
    setActiveTextBox(textBoxData);

    // Make it draggable
    makeDraggable(textBox, textBoxData);

    // Clear input
    textInput.value = '';
    textInput.focus();
}

// Make text box draggable
function makeDraggable(textBox, textBoxData) {
    textBox.addEventListener('mousedown', function(e) {
        if (e.target === textBox || e.target === textBoxData.content) {
            isDragging = true;
            setActiveTextBox(textBoxData);

            const rect = textBox.getBoundingClientRect();
            const containerRect = textBoxContainer.getBoundingClientRect();

            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;

            textBox.classList.add('dragging');
            e.preventDefault();
        }
    });

    textBox.addEventListener('click', function(e) {
        if (!isDragging) {
            setActiveTextBox(textBoxData);
        }
    });
}

// Set active text box
function setActiveTextBox(textBoxData) {
    // Remove active class from all text boxes
    textBoxes.forEach(tb => {
        tb.element.classList.remove('active');
    });

    // Set new active text box
    activeTextBox = textBoxData;
    textBoxData.element.classList.add('active');

    // Update controls to match active text box
    fontSizeSlider.value = textBoxData.fontSize;
    fontSizeInput.value = textBoxData.fontSize;
}

// Handle mouse move for dragging
document.addEventListener('mousemove', function(e) {
    if (!isDragging || !activeTextBox) return;

    const containerRect = textBoxContainer.getBoundingClientRect();
    const textBoxRect = activeTextBox.element.getBoundingClientRect();

    let x = e.clientX - containerRect.left - dragOffset.x;
    let y = e.clientY - containerRect.top - dragOffset.y;

    // Constrain within container
    x = Math.max(0, Math.min(x, containerRect.width - textBoxRect.width));
    y = Math.max(0, Math.min(y, containerRect.height - textBoxRect.height));

    activeTextBox.element.style.left = x + 'px';
    activeTextBox.element.style.top = y + 'px';

    activeTextBox.x = x;
    activeTextBox.y = y;
});

// Handle mouse up to stop dragging
document.addEventListener('mouseup', function() {
    if (isDragging && activeTextBox) {
        activeTextBox.element.classList.remove('dragging');
        isDragging = false;
    }
});

// Update text size
function updateTextSize() {
    if (!activeTextBox) return;

    const size = parseInt(fontSizeSlider.value);

    // Sync slider and input
    fontSizeInput.value = size;
    fontSizeSlider.value = size;

    // Update active text box
    activeTextBox.fontSize = size;
    activeTextBox.content.style.fontSize = size + 'px';
}

// Sync font size controls
fontSizeSlider.addEventListener('input', function() {
    fontSizeInput.value = fontSizeSlider.value;
    updateTextSize();
});

fontSizeInput.addEventListener('input', function() {
    let value = parseInt(fontSizeInput.value);
    if (isNaN(value)) return;

    // Clamp value to slider range
    value = Math.max(12, Math.min(120, value));
    fontSizeInput.value = value;
    fontSizeSlider.value = value;
    updateTextSize();
});

// Render to canvas for download
function renderToCanvas() {
    if (!currentImage) return null;

    // Create a temporary canvas for rendering
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw the base image
    tempCtx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);

    // Draw all text boxes
    textBoxes.forEach(textBoxData => {
        const element = textBoxData.element;
        const content = textBoxData.content;
        const rect = element.getBoundingClientRect();
        const containerRect = textBoxContainer.getBoundingClientRect();

        // Calculate position relative to canvas
        const x = parseFloat(element.style.left) || 0;
        const y = parseFloat(element.style.top) || 0;

        // Get text and font size
        const text = textBoxData.text;
        const fontSize = textBoxData.fontSize;

        // Set font
        tempCtx.font = `bold ${fontSize}px Arial, sans-serif`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';

        // Calculate text position (center of text box)
        const textX = x + (rect.width / 2);
        const textY = y + (rect.height / 2);

        // Draw text with black stroke (border)
        tempCtx.strokeStyle = '#000000';
        tempCtx.lineWidth = 4;
        tempCtx.lineJoin = 'round';
        tempCtx.miterLimit = 2;
        tempCtx.strokeText(text, textX, textY);

        // Draw text with white fill
        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillText(text, textX, textY);
    });

    return tempCanvas;
}

// Download meme
function downloadMeme() {
    const tempCanvas = renderToCanvas();
    if (!tempCanvas) return;

    // Convert canvas to blob and download
    tempCanvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'meme.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/png');
}

// Event listeners
imageInput.addEventListener('change', handleImageUpload);
addTextBtn.addEventListener('click', addTextBox);
textInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addTextBox();
    }
});
downloadBtn.addEventListener('click', downloadMeme);

// Template selection listeners
document.querySelectorAll('.template-item').forEach(item => {
    item.addEventListener('click', function() {
        const templatePath = this.getAttribute('data-template');
        handleTemplateSelect(templatePath);
    });
});

// Allow deleting text boxes with Delete key
document.addEventListener('keydown', function(e) {
    if ((e.key === 'Delete' || e.key === 'Backspace') && activeTextBox) {
        // Remove from DOM
        activeTextBox.element.remove();

        // Remove from array
        const index = textBoxes.indexOf(activeTextBox);
        if (index > -1) {
            textBoxes.splice(index, 1);
        }

        // Clear active text box
        activeTextBox = null;

        // If there are other text boxes, activate the last one
        if (textBoxes.length > 0) {
            setActiveTextBox(textBoxes[textBoxes.length - 1]);
        }
    }
});

