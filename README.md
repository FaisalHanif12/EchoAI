# EchoAI Chatbot v2.0

An advanced, feature-rich chat interface powered by Google's Gemini AI models. This project demonstrates a modern, responsive user interface with state-of-the-art chat features similar to ChatGPT and other leading conversational AI platforms.

![EchoAI Screenshot](https://via.placeholder.com/800x450.png?text=EchoAI+Chatbot)

## Features

### Core Features
- 🔄 Real-time conversations with Gemini AI
- 📱 Fully responsive design for all devices
- 🌓 Dark/light mode toggle with system preference detection
- 💬 Complete chat history management
- 🔍 Search through past conversations

### Advanced UI Features
- 📋 Message actions (copy, edit, delete)
- 😊 Message reactions with emoji picker
- 🔊 Enhanced voice input with real-time transcription
- 💡 Smart suggested prompts based on conversation context
- ⌨️ Markdown and code syntax highlighting
- ⚡ Visual typing indicators and message status

### AI Features
- 🧠 Model selection (Gemini Flash vs Gemini Pro)
- 🔗 Conversation context preservation
- 📝 Conversation summarization
- 🔄 Smart title generation for chats

### Productivity Features
- 💾 Export conversations as JSON
- 🗑️ Clear conversations with a single command
- ⌨️ Command system with /help, /clear, /export, /summarize
- 🔄 Message editing and deletion
- 🔍 Chat search functionality

## Available Commands

Type these commands in the chat input:

- `/help` - Display available commands and tips
- `/clear` - Clear the current conversation
- `/export` - Export the current conversation as a JSON file
- `/summarize` - Generate a summary of the current conversation

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/echoai-chatbot.git

# Navigate to the project directory
cd echoai-chatbot

# Install dependencies
npm install

# Start the development server
npm start
```

## Dependencies

- React 18+
- Axios for API requests
- react-markdown for markdown rendering
- react-syntax-highlighter for code highlighting
- file-saver for exporting conversations
- uuid for generating unique IDs

## API Usage

This project uses Google's Gemini API. You'll need to:

1. Get your own API key from [Google AI Studio](https://ai.google.dev/)
2. Replace the API_KEY in src/services/geminiService.js with your key

## Future Enhancements

- File attachments and image sharing
- Custom instruction profiles
- User authentication and cloud sync
- Plugin system for extending functionality
- Mobile app versions using React Native

## License

MIT License - Feel free to use, modify, and distribute as you see fit.

## Acknowledgements

- Google's Gemini AI for powering the conversations
- The React community for the incredible ecosystem

---

Built with ❤️ by [Your Name]


