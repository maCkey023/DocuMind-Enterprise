import React, { useState, useRef } from 'react';
import { Box, ThemeProvider, createTheme, CssBaseline, GlobalStyles } from '@mui/material';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

// 🎨 THE "MIDNIGHT AURORA" ENTERPRISE THEME
const auroraTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#09090b', paper: '#18181b' },
    primary: { main: '#8b5cf6' },
    secondary: { main: '#06b6d4' },
    text: { primary: '#f4f4f5', secondary: '#a1a1aa' },
    divider: '#27272a',
  },
  typography: { fontFamily: '"Inter", sans-serif' },
  shape: { borderRadius: 12 },
});

// 🎨 CUSTOM FADING SCROLLBARS
const globalScrollbarStyles = (
  <GlobalStyles styles={{
    '*::-webkit-scrollbar': { width: '8px', height: '8px' },
    '*::-webkit-scrollbar-track': { background: 'transparent' },
    '*::-webkit-scrollbar-thumb': { background: '#3f3f46', borderRadius: '10px', border: '2px solid #09090b' },
    '*::-webkit-scrollbar-thumb:hover': { background: '#52525b' },
  }} />
);

export default function App() {
  // --- LAYOUT STATE ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- SESSION STATE ---
  const [sessions, setSessions] = useState([{ id: Date.now().toString(), title: "New Chat", messages: [] }]);
  const [activeSessionId, setActiveSessionId] = useState(sessions[0].id);
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession.messages;

  // --- UI STATE ---
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const fileInputRef = useRef(null);

  // --- SESSION CONTROLS ---
  const handleNewChat = async () => {
    try { await fetch('http://127.0.0.1:8000/api/new-chat'); } catch (e) { }
    const newId = Date.now().toString();
    setSessions((prev) => [{ id: newId, title: "New Chat", messages: [] }, ...prev]);
    setActiveSessionId(newId);
  };

  const handleSwitchSession = (id) => setActiveSessionId(id);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // --- API LOGIC: UPLOAD ---
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (data.status === 'success') {
        setSessions((prev) => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, { role: 'ai', content: `✅ Successfully ingested: ${data.filename}` }] } : s));
      }
    } catch (error) { console.error("Upload error"); }
    finally { setIsUploading(false); event.target.value = null; }
  };

  // --- API LOGIC: CLEAR ---
  const handleClearBrain = async () => {
    if (!window.confirm("🚨 Wipe the Pinecone database completely?")) return;
    setIsClearing(true);
    try {
      await fetch('http://127.0.0.1:8000/api/clear-index');
      const newId = Date.now().toString();
      setSessions([{ id: newId, title: "Memory Wiped", messages: [{ role: 'ai', content: "🧹 Brain wiped. I have forgotten everything." }] }]);
      setActiveSessionId(newId);
    } catch (error) { console.error("Clear failed."); }
    finally { setIsClearing(false); }
  };

  // --- API LOGIC: CHAT ---
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    const currentSessionId = activeSessionId;
    setInput('');
    setIsLoading(true);

    setSessions((prev) => prev.map(s => {
      if (s.id === currentSessionId) {
        const newTitle = s.messages.length === 0 ? userMessage.substring(0, 22) + "..." : s.title;
        return { ...s, title: newTitle, messages: [...s.messages, { role: 'user', content: userMessage }, { role: 'ai', content: '', citations: [] }] };
      }
      return s;
    }));

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, session_id: currentSessionId })
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '');
            try {
              const parsedData = JSON.parse(dataStr);
              if (parsedData.token) {
                setSessions((prev) => prev.map(s => {
                  if (s.id === currentSessionId) {
                    const newMessages = [...s.messages];
                    newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], content: newMessages[newMessages.length - 1].content + parsedData.token };
                    return { ...s, messages: newMessages };
                  }
                  return s;
                }));
              }
              if (parsedData.citations) {
                setSessions((prev) => prev.map(s => {
                  if (s.id === currentSessionId) {
                    const newMessages = [...s.messages];
                    newMessages[newMessages.length - 1] = { ...newMessages[newMessages.length - 1], citations: parsedData.citations };
                    return { ...s, messages: newMessages };
                  }
                  return s;
                }));
              }
            } catch (e) { }
          }
        }
      }
    } catch (error) { console.error("Backend error"); }
    finally { setIsLoading(false); }
  };

  return (
    <ThemeProvider theme={auroraTheme}>
      <CssBaseline />
      {globalScrollbarStyles}
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'background.default' }}>

        {/* Only render Sidebar if isSidebarOpen is true */}
        {isSidebarOpen && (
          <Sidebar
            isUploading={isUploading} fileInputRef={fileInputRef} handleFileUpload={handleFileUpload}
            handleClearBrain={handleClearBrain} isClearing={isClearing} sessions={sessions}
            activeSessionId={activeSessionId} handleSwitchSession={handleSwitchSession}
            toggleSidebar={toggleSidebar}
          />
        )}

        <ChatWindow
          messages={messages} isLoading={isLoading} input={input} setInput={setInput}
          handleSendMessage={handleSendMessage} handleNewChat={handleNewChat}
          toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}
        />
      </Box>
    </ThemeProvider>
  );
}