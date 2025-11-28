<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Claude UI Clone with Gemini

A fully functional clone of Claude's chat interface powered by Google's Gemini AI, featuring web search capabilities, artifact generation, and a beautiful, responsive UI.

## Features

- 🤖 **AI Chat** - Powered by Gemini 2.5 Flash and Gemini 3 Pro Preview
- 🔍 **Web Search** - Integrated Google Custom Search with automatic content fetching
- 📝 **Artifact Panel** - View and interact with generated code and content
- 🎨 **Beautiful UI** - Pixel-perfect clone of Claude's interface
- ⚡ **Real-time Streaming** - See AI responses as they're generated
- 🌐 **Search Results** - Interactive search result cards with content fetching
- 📱 **Responsive Design** - Works seamlessly on all devices

## Run Locally

**Prerequisites:** Node.js (v16 or higher)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Copy `.env.example` to `.env` and add your API keys:
   
   ```bash
   # Required
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Optional (for web search feature)
   VITE_GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
   VITE_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
   ```

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Web Search Setup (Optional)

To enable real web search (otherwise mock results are used):

1. Create a Custom Search Engine at [Google Programmable Search](https://programmablesearchengine.google.com/)
2. Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
3. Add credentials to your `.env` file

## Usage

1. **Start a conversation** - Type your message in the chat input
2. **Enable web search** - Click the sliders icon and toggle "Web search" on
3. **Ask questions** - The AI will automatically search the web for relevant information
4. **View results** - See search results and fetched content inline
5. **Generate artifacts** - Ask the AI to create code, and it will appear in the artifact panel

## Tech Stack

- **Frontend:** React 19, TypeScript
- **AI:** Google Gemini API
- **Search:** Google Custom Search API
- **Styling:** Vanilla CSS
- **Icons:** Lucide React
- **Markdown:** React Markdown
- **Build Tool:** Vite

## Project Structure

```
├── components/
│   ├── ChatInterface.tsx    # Main chat UI with search integration
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── ArtifactPanel.tsx    # Code/content viewer
│   └── RecentChatsGrid.tsx  # Recent conversations
├── services/
│   ├── geminiService.ts     # Gemini AI integration
│   └── searchService.ts     # Web search functionality
├── types.ts                 # TypeScript interfaces
└── App.tsx                  # Main application

```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

