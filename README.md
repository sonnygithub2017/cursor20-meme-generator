# Meme Generator

A real-time collaborative meme generator built with React and InstantDB. Create memes with customizable text overlays, browse a community feed, and interact with memes through upvoting.

## Features

### Authentication
- **Magic Link Authentication**: Sign in using email-based magic link authentication
- **User Session Management**: Persistent user sessions with sign-out functionality

### Meme Creation
- **Template Gallery**: Choose from pre-loaded meme templates
- **Custom Image Upload**: Upload your own images to create memes
- **Text Overlay System**:
  - Add multiple text boxes to images
  - Drag and drop text positioning
  - Adjustable font size (12px - 120px)
  - Automatic text wrapping for long content
  - Delete text boxes with Delete key
- **Canvas Editor**: Interactive canvas with real-time preview
- **Download**: Save your memes as PNG files
- **Post to Feed**: Share your creations to the community feed

### Meme Feed
- **Browse Memes**: View all memes posted by the community
- **Sorting Options**:
  - Sort by newest
  - Sort by most upvoted
- **Upvoting System**: Upvote your favorite memes (requires sign-in)
- **Sample Memes**: Includes seed memes to get started
- **Real-time Updates**: See new memes and upvotes in real-time

### User Interface
- **Tab Navigation**: Switch between Meme Feed and Create Meme views
- **Responsive Design**: Clean, minimalistic interface
- **Toast Notifications**: Success and error messages for user actions

## Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool and development server
- **InstantDB**: Real-time database and authentication
- **HTML5 Canvas**: Image rendering and manipulation

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## How to Run

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cursor20_vibe_coding
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

### Building for Production

Build the application for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
cursor20_vibe_coding/
├── src/
│   ├── components/
│   │   ├── Auth.jsx              # Authentication component
│   │   ├── CanvasEditor.jsx      # Canvas editor with text overlay system
│   │   ├── ControlsPanel.jsx     # Meme creation controls
│   │   ├── MemeCard.jsx          # Individual meme card component
│   │   ├── MemeFeed.jsx          # Meme feed with sorting
│   │   ├── MemeGenerator.jsx     # Main meme creation component
│   │   └── TemplateGallery.jsx   # Template selection gallery
│   ├── data/
│   │   └── seedMemes.js          # Sample memes data
│   ├── lib/
│   │   └── db.js                 # InstantDB configuration
│   ├── App.jsx                   # Main app component
│   └── App.css                   # Application styles
├── public/
│   └── assets/                   # Image assets and templates
├── instant.schema.ts             # InstantDB schema definition
├── vite.config.js                # Vite configuration
└── package.json                  # Project dependencies
```

## Database Schema

The application uses InstantDB with the following schema:

- **memes**: Stores meme posts
  - `imageUrl`: Base64 encoded image data
  - `createdAt`: Timestamp
  - `userId`: User ID of creator
  - `upvoteCount`: Number of upvotes

- **upvotes**: Tracks user upvotes
  - `memeId`: Reference to meme
  - `userId`: User who upvoted

## Usage

1. **Sign In**: Click "Create Meme" and enter your email to receive a magic link code
2. **Create Meme**:
   - Select a template or upload your own image
   - Add text using the text input field
   - Adjust font size with the slider
   - Drag text boxes to position them
   - Delete text boxes by selecting them and pressing Delete
   - Download or post your meme
3. **Browse Feed**: View all memes, sort by newest or upvotes, and upvote your favorites

## Development Notes

- The app uses InstantDB for real-time synchronization
- Canvas rendering handles automatic text wrapping and positioning
- Seed memes are included for demonstration purposes
- User authentication is required to post and upvote memes

## License

This project is part of a coding course/workshop.

