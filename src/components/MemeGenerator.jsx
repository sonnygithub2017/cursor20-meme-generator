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
    if (activeTextBoxId) {
      const textBox = textBoxes.find((tb) => tb.id === activeTextBoxId);
      if (textBox) {
        handleTextBoxUpdate(activeTextBoxId, { fontSize });
      }
    }
  }, [fontSize]);

  const renderToCanvas = (canvasElement) => {
    if (!currentImage || !canvasElement) return null;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasElement.width;
    tempCanvas.height = canvasElement.height;
    const tempCtx = tempCanvas.getContext('2d');

    tempCtx.drawImage(currentImage, 0, 0, canvasElement.width, canvasElement.height);

    textBoxes.forEach((textBox) => {
      const text = textBox.text;
      const fontSize = textBox.fontSize;

      tempCtx.font = `bold ${fontSize}px Arial, sans-serif`;
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';

      const textBoxElement = document.getElementById(`textbox-${textBox.id}`);
      let textX, textY;

      if (textBoxElement) {
        const rect = textBoxElement.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (containerRect) {
          const relativeX = rect.left - containerRect.left + rect.width / 2;
          const relativeY = rect.top - containerRect.top + rect.height / 2;
          textX = relativeX;
          textY = relativeY;
        } else {
          textX = textBox.x + 50;
          textY = textBox.y + 15;
        }
      } else {
        textX = textBox.x + 50;
        textY = textBox.y + 15;
      }

      tempCtx.strokeStyle = '#000000';
      tempCtx.lineWidth = 4;
      tempCtx.lineJoin = 'round';
      tempCtx.miterLimit = 2;
      tempCtx.strokeText(text, textX, textY);

      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillText(text, textX, textY);
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

