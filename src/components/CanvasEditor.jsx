import { useEffect, useRef } from 'react';

export default function CanvasEditor({
  currentImage,
  textBoxes,
  activeTextBoxId,
  onTextBoxUpdate,
  onSetActiveTextBox,
  containerRef,
  canvasRef,
}) {
  const textBoxContainerRef = useRef(null);

  useEffect(() => {
    if (currentImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const maxWidth = 800;
      const maxHeight = 600;
      let width = currentImage.width;
      let height = currentImage.height;

      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = width * scale;
        height = height * scale;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(currentImage, 0, 0, width, height);

      if (textBoxContainerRef.current) {
        textBoxContainerRef.current.style.width = width + 'px';
        textBoxContainerRef.current.style.height = height + 'px';
      }
    }
  }, [currentImage]);

  useEffect(() => {
    if (!textBoxContainerRef.current) return;

    const handleMouseMove = (e) => {
      if (!activeTextBoxId) return;
      const activeTextBox = textBoxes.find((tb) => tb.id === activeTextBoxId);
      if (!activeTextBox || !activeTextBox.isDragging) return;

      const containerRect = textBoxContainerRef.current.getBoundingClientRect();
      const textBoxElement = document.getElementById(`textbox-${activeTextBox.id}`);
      if (!textBoxElement) return;

      const textBoxRect = textBoxElement.getBoundingClientRect();

      let x = e.clientX - containerRect.left - activeTextBox.dragOffset.x;
      let y = e.clientY - containerRect.top - activeTextBox.dragOffset.y;

      x = Math.max(0, Math.min(x, containerRect.width - textBoxRect.width));
      y = Math.max(0, Math.min(y, containerRect.height - textBoxRect.height));

      onTextBoxUpdate(activeTextBox.id, { x, y });
    };

    const handleMouseUp = () => {
      if (activeTextBoxId) {
        const activeTextBox = textBoxes.find((tb) => tb.id === activeTextBoxId);
        if (activeTextBox) {
          onTextBoxUpdate(activeTextBox.id, { isDragging: false });
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeTextBoxId, textBoxes, onTextBoxUpdate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && activeTextBoxId) {
        const activeTextBox = textBoxes.find((tb) => tb.id === activeTextBoxId);
        if (activeTextBox) {
          onTextBoxUpdate(activeTextBox.id, { deleted: true });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTextBoxId, textBoxes, onTextBoxUpdate]);

  const handleTextBoxMouseDown = (e, textBox) => {
    if (e.target.id === `textbox-${textBox.id}` || e.target.className === 'text-box-content') {
      const rect = e.currentTarget.getBoundingClientRect();
      const containerRect = textBoxContainerRef.current.getBoundingClientRect();

      const dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      onSetActiveTextBox(textBox.id);
      onTextBoxUpdate(textBox.id, { isDragging: true, dragOffset });
      e.preventDefault();
    }
  };

  const handleTextBoxClick = (e, textBox) => {
    if (!textBox.isDragging) {
      onSetActiveTextBox(textBox.id);
    }
  };

  return (
    <div className="canvas-container" ref={containerRef}>
      <canvas ref={canvasRef} className="canvas" />
      <div ref={textBoxContainerRef} className="text-box-container">
        {textBoxes.map((textBox) => (
          <div
            key={textBox.id}
            id={`textbox-${textBox.id}`}
            className={`text-box ${activeTextBoxId === textBox.id ? 'active' : ''} ${
              textBox.isDragging ? 'dragging' : ''
            }`}
            style={{
              left: textBox.x + 'px',
              top: textBox.y + 'px',
            }}
            onMouseDown={(e) => handleTextBoxMouseDown(e, textBox)}
            onClick={(e) => handleTextBoxClick(e, textBox)}
          >
            <div
              className="text-box-content"
              style={{ fontSize: textBox.fontSize + 'px' }}
            >
              {textBox.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

