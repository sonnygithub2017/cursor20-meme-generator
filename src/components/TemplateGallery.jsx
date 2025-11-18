export default function TemplateGallery({ onSelectTemplate, selectedTemplate }) {
  const templates = [
    '/assets/cartoon_puppy.jpg',
    '/assets/dog_bird.jpg',
    '/assets/man_sofa.png',
    '/assets/puppy-lying-sweater.jpg',
  ];

  return (
    <div className="template-gallery">
      {templates.map((template, index) => (
        <div
          key={index}
          className={`template-item ${selectedTemplate === template ? 'active' : ''}`}
          onClick={() => onSelectTemplate(template)}
        >
          <img src={template} alt={`Template ${index + 1}`} />
        </div>
      ))}
    </div>
  );
}

