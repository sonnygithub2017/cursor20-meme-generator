import { useState, useRef, useEffect } from 'react';
import { db, tx, id } from '../lib/db';
import ControlsPanel from './ControlsPanel';
import CanvasEditor from './CanvasEditor';

export default function MemeGenerator() {
  const [currentImage, setCurrentImage] = useState(null);
  const [textBoxes, setTextBoxes] = useState([]);
  const [activeTextBoxId, setActiveTextBoxId] = useState(null);
  const [textBoxIdCounter, setTextBoxIdCounter] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(48);
  const [isPosting, setIsPosting] = useState(false);
  const [toast, setToast] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const { user } = db.useAuth();

  const loadImage = (source) => {
    const img = new Image();
    img.onload = () => {
      setCurrentImage(img);
      setTextBoxes([]);
      setActiveTextBoxId(null);
    };
    img.src = source;
  };

  const handleTemplateSelect = (templatePath) => {
    loadImage(templatePath);
    setSelectedTemplate(templatePath);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedTemplate(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      loadImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddText = () => {
    const text = textInput.trim();
    if (!text || !currentImage) return;

    const newId = textBoxIdCounter;
    setTextBoxIdCounter(newId + 1);

    const containerRect = containerRef.current?.getBoundingClientRect();
    const newTextBox = {
      id: newId,
      text,
      fontSize,
      x: containerRect ? containerRect.width / 2 - 50 : 0,
      y: containerRect ? containerRect.height / 2 - 15 : 0,
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
    };

    setTextBoxes([...textBoxes, newTextBox]);
    setActiveTextBoxId(newId);
    setTextInput('');
  };

  const handleTextBoxUpdate = (textBoxId, updates) => {
    if (updates.deleted) {
      const newTextBoxes = textBoxes.filter((tb) => tb.id !== textBoxId);
      setTextBoxes(newTextBoxes);
      if (activeTextBoxId === textBoxId) {
        setActiveTextBoxId(newTextBoxes.length > 0 ? newTextBoxes[newTextBoxes.length - 1].id : null);
      }
    } else {
      setTextBoxes(
        textBoxes.map((tb) => (tb.id === textBoxId ? { ...tb, ...updates } : tb))
      );
    }
  };

  const handleSetActiveTextBox = (textBoxId) => {
    setActiveTextBoxId(textBoxId);
    const textBox = textBoxes.find((tb) => tb.id === textBoxId);
    if (textBox) {
      setFontSize(textBox.fontSize);
    }
  };

  useEffect(() => {
    if (activeTextBoxId !== null) {
      const textBox = textBoxes.find((tb) => tb.id === activeTextBoxId);
      if (textBox && textBox.fontSize !== fontSize) {
        handleTextBoxUpdate(activeTextBoxId, { fontSize });
      }
    }
  }, [fontSize, activeTextBoxId, textBoxes]);

  const getTextBoxRect = (textBoxId) => {
    const textBoxElement = document.getElementById(`textbox-${textBoxId}`);
    if (!textBoxElement) return null;
    const containerElement = textBoxElement.closest('.text-box-container');
    if (!containerElement) return null;

    const rect = textBoxElement.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();

    return {
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
      width: rect.width,
      height: rect.height,
    };
  };

  const breakWordIntoSegments = (context, word, maxWidth) => {
    const segments = [];
    let currentSegment = '';

    for (const char of word) {
      const tentative = currentSegment + char;
      if (!currentSegment || context.measureText(tentative).width <= maxWidth) {
        currentSegment = tentative;
      } else {
        segments.push(currentSegment);
        currentSegment = char;
      }
    }

    if (currentSegment) {
      segments.push(currentSegment);
    }

    return segments;
  };

  const wrapTextToWidth = (context, text, maxWidth) => {
    const safeMaxWidth = Math.max(40, maxWidth);
    const lines = [];
    const paragraphs = text.split('\n');

    paragraphs.forEach((paragraph, paragraphIndex) => {
      const words = paragraph.split(' ').filter((word) => word.length > 0);
      let currentLine = '';

      if (words.length === 0) {
        lines.push(' ');
      }

      words.forEach((word) => {
        const tentativeLine = currentLine ? `${currentLine} ${word}` : word;
        if (context.measureText(tentativeLine).width <= safeMaxWidth) {
          currentLine = tentativeLine;
          return;
        }

        if (currentLine) {
          lines.push(currentLine);
        }

        if (context.measureText(word).width <= safeMaxWidth) {
          currentLine = word;
          return;
        }

        const brokenWordSegments = breakWordIntoSegments(context, word, safeMaxWidth);
        brokenWordSegments.slice(0, -1).forEach((segment) => {
          lines.push(segment);
        });
        currentLine = brokenWordSegments[brokenWordSegments.length - 1] || '';
      });

      if (currentLine) {
        lines.push(currentLine);
      }

      if (paragraphIndex < paragraphs.length - 1) {
        lines.push(' ');
      }
    });

    return lines.length > 0 ? lines : [' '];
  };

  const renderToCanvas = (canvasElement) => {
    if (!currentImage || !canvasElement) return null;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasElement.width;
    tempCanvas.height = canvasElement.height;
    const tempCtx = tempCanvas.getContext('2d');

    const canvasWidth = canvasElement.width;
    const canvasHeight = canvasElement.height;

    tempCtx.drawImage(currentImage, 0, 0, canvasWidth, canvasHeight);

    textBoxes.forEach((textBox) => {
      const text = textBox.text;
      if (!text) {
        return;
      }

      const fontSize = textBox.fontSize;
      const padding = 12;
      tempCtx.font = `bold ${fontSize}px Arial, sans-serif`;
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';

      const rect = getTextBoxRect(textBox.id);
      const fallbackWidth = Math.min(canvasWidth - padding * 2, canvasWidth * 0.9);
      const safeBoxWidth = Math.max(
        80,
        Math.min(canvasWidth - padding * 2, rect?.width || fallbackWidth)
      );
      const lineWidth = Math.max(40, safeBoxWidth - padding * 2);

      let originX = rect ? rect.x : textBox.x;
      let originY = rect ? rect.y : textBox.y;
      let textX = originX + safeBoxWidth / 2;

      const lines = wrapTextToWidth(tempCtx, text, lineWidth);
      const lineHeight = fontSize * 1.2;
      const totalHeight = Math.max(lineHeight, lines.length * lineHeight);
      let textY = originY + totalHeight / 2;

      const halfWidth = safeBoxWidth / 2;
      const halfHeight = totalHeight / 2;

      textX = Math.max(halfWidth + padding, Math.min(textX, canvasWidth - halfWidth - padding));
      textY = Math.max(halfHeight + padding, Math.min(textY, canvasHeight - halfHeight - padding));

      tempCtx.strokeStyle = '#000000';
      tempCtx.lineWidth = 4;
      tempCtx.lineJoin = 'round';
      tempCtx.miterLimit = 2;
      tempCtx.fillStyle = '#FFFFFF';

      let currentLineY = textY - halfHeight + lineHeight / 2;

      lines.forEach((line) => {
        tempCtx.strokeText(line, textX, currentLineY);
        tempCtx.fillText(line, textX, currentLineY);
        currentLineY += lineHeight;
      });
    });

    return tempCanvas;
  };

  const handleDownload = () => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    const tempCanvas = renderToCanvas(canvasElement);
    if (!tempCanvas) return;

    tempCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meme.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const handlePost = async () => {
    if (!user || !currentImage) return;

    setIsPosting(true);
    try {
      const canvasElement = canvasRef.current;
      if (!canvasElement) {
        throw new Error('Canvas not available');
      }
      const tempCanvas = renderToCanvas(canvasElement);
      if (!tempCanvas) {
        throw new Error('Failed to render canvas');
      }

      const imageUrl = tempCanvas.toDataURL('image/png');

      await db.transact(
        tx.memes[id()].update({
          imageUrl,
          createdAt: Date.now(),
          userId: user.id,
          upvoteCount: 0,
        })
      );

      setToast({ message: 'Meme posted successfully!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Error posting meme:', error);
      setToast({ message: 'Failed to post meme. Please try again.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setIsPosting(false);
    }
  };

  const canDownload = currentImage !== null;
  const canPost = user && currentImage && textBoxes.length > 0;

  return (
    <>
      <div className="main-content">
        <ControlsPanel
          onSelectTemplate={handleTemplateSelect}
          selectedTemplate={selectedTemplate}
          onImageUpload={handleImageUpload}
          onAddText={handleAddText}
          textInput={textInput}
          setTextInput={setTextInput}
          fontSize={fontSize}
          setFontSize={setFontSize}
          onDownload={handleDownload}
          onPost={handlePost}
          canDownload={canDownload}
          canPost={canPost}
          isPosting={isPosting}
        />
        <CanvasEditor
          currentImage={currentImage}
          textBoxes={textBoxes}
          activeTextBoxId={activeTextBoxId}
          onTextBoxUpdate={handleTextBoxUpdate}
          onSetActiveTextBox={handleSetActiveTextBox}
          containerRef={containerRef}
          canvasRef={canvasRef}
        />
      </div>
      {toast && (
        <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}

