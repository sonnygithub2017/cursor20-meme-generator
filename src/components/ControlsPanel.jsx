import TemplateGallery from './TemplateGallery';

export default function ControlsPanel({
  onSelectTemplate,
  selectedTemplate,
  onImageUpload,
  onAddText,
  textInput,
  setTextInput,
  fontSize,
  setFontSize,
  onDownload,
  onPost,
  canDownload,
  canPost,
  isPosting,
}) {
  return (
    <div className="controls-panel">
      <div className="control-group">
        <label>Choose Template</label>
        <TemplateGallery
          onSelectTemplate={onSelectTemplate}
          selectedTemplate={selectedTemplate}
        />
      </div>

      <div className="control-group">
        <label htmlFor="imageInput" className="file-input-label">
          <span>Upload Your Own Image</span>
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            hidden
            onChange={onImageUpload}
          />
        </label>
      </div>

      <div className="control-group">
        <label htmlFor="textInput">Add Text</label>
        <input
          type="text"
          id="textInput"
          placeholder="Type your meme text..."
          className="text-input"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onAddText();
            }
          }}
        />
        <button className="btn btn-primary" onClick={onAddText}>
          Add Text
        </button>
      </div>

      <div className="control-group">
        <label htmlFor="fontSizeSlider">Font Size</label>
        <div className="size-controls">
          <input
            type="range"
            id="fontSizeSlider"
            min="12"
            max="120"
            value={fontSize}
            className="slider"
            onChange={(e) => setFontSize(parseInt(e.target.value))}
          />
          <input
            type="number"
            id="fontSizeInput"
            min="12"
            max="120"
            value={fontSize}
            className="number-input"
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value)) {
                const clamped = Math.max(12, Math.min(120, value));
                setFontSize(clamped);
              }
            }}
          />
          <span className="unit">px</span>
        </div>
      </div>

      <div className="control-group">
        <button
          className="btn btn-post"
          onClick={onPost}
          disabled={!canPost || isPosting}
        >
          {isPosting ? 'Posting...' : 'Post Meme'}
        </button>
        <button
          className="btn btn-download"
          onClick={onDownload}
          disabled={!canDownload}
        >
          Download Meme
        </button>
      </div>
    </div>
  );
}

