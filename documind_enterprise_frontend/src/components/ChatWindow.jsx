import React, { useRef, useEffect } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress, IconButton, TextField, Avatar, Tooltip } from '@mui/material';
import { Send, Article, Person, SmartToy, Menu, Add } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';

export default function ChatWindow({ messages, isLoading, input, setInput, handleSendMessage, handleNewChat, toggleSidebar, isSidebarOpen }) {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', bgcolor: 'background.default' }}>

            {/* Ultra-Minimal Top Bar */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
                <Box>
                    {!isSidebarOpen && (
                        <Tooltip title="Open Sidebar">
                            <IconButton onClick={toggleSidebar} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(139, 92, 246, 0.1)' } }}>
                                <Menu />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
                <Tooltip title="New Chat Session">
                    <IconButton onClick={handleNewChat} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(139, 92, 246, 0.1)' } }}>
                        <Add />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Messages Area (Centered Gemini Style) */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 8, pb: 4 }}>
                <Box sx={{ width: '100%', maxWidth: '800px', px: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {messages.length === 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 2 }}>
                            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)' }}>
                                <SmartToy fontSize="large" />
                            </Avatar>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary' }}>How can I help you today?</Typography>
                        </Box>
                    ) : (
                        messages.map((msg, index) => {
                            const isUser = msg.role === 'user';
                            return (
                                <Box key={index} sx={{ display: 'flex', gap: 2, flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                                    <Avatar sx={{ bgcolor: isUser ? 'primary.main' : '#27272a', color: isUser ? '#fff' : 'secondary.main', width: 36, height: 36, mt: 1 }}>
                                        {isUser ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
                                    </Avatar>
                                    <Paper elevation={0} sx={{
                                        p: 2, maxWidth: '85%', bgcolor: isUser ? 'rgba(139, 92, 246, 0.1)' : 'transparent', color: '#fff',
                                        borderRadius: 3, border: isUser ? '1px solid rgba(139, 92, 246, 0.3)' : 'none'
                                    }}>
                                        <Typography component="div" variant="body1" sx={{ minHeight: '1.5em', wordBreak: 'break-word', lineHeight: 1.8, '& p': { margin: 0, paddingBottom: 1 }, '& ul, & ol': { marginTop: 0, paddingLeft: 3, paddingBottom: 1 }, '& strong': { color: 'secondary.main' }, '& code': { bgcolor: '#27272a', px: 1, py: 0.5, borderRadius: 1, fontFamily: 'monospace' } }}>
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </Typography>
                                        {msg.citations && msg.citations.length > 0 && (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                                {msg.citations.map((cite, i) => (
                                                    <Chip key={i} icon={<Article fontSize="small" sx={{ color: '#06b6d4 !important' }} />} label={cite} size="small" sx={{ bgcolor: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', fontWeight: 'bold', border: '1px solid rgba(6, 182, 212, 0.3)' }} />
                                                ))}
                                            </Box>
                                        )}
                                    </Paper>
                                </Box>
                            );
                        })
                    )}
                    {isLoading && (
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: '#27272a', color: 'secondary.main', width: 36, height: 36 }}><SmartToy fontSize="small" /></Avatar>
                            <CircularProgress size={20} sx={{ color: 'secondary.main' }} />
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>
            </Box>

            {/* Input Area (Centered Gemini Style) */}
            <Box sx={{ pb: 4, pt: 1, px: 2, display: 'flex', justifyContent: 'center', bgcolor: 'background.default' }}>
                <Box sx={{ width: '100%', maxWidth: '800px', display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', p: 1, pl: 3, borderRadius: '24px', border: '1px solid', borderColor: '#3f3f46', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', '&:focus-within': { borderColor: 'primary.main' }, transition: 'border-color 0.2s' }}>
                    <TextField
                        fullWidth variant="standard" placeholder="Message DocuMind..." multiline maxRows={4}
                        InputProps={{ disableUnderline: true, style: { color: '#f4f4f5', lineHeight: 1.5 } }}
                        value={input} onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    />
                    <IconButton onClick={handleSendMessage} disabled={isLoading || !input.trim()} sx={{ bgcolor: input.trim() ? 'primary.main' : '#27272a', color: 'white', '&:hover': { bgcolor: '#7c3aed' }, borderRadius: '50%', p: 1.5 }}>
                        <Send fontSize="small" sx={{ ml: 0.5 }} />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
}