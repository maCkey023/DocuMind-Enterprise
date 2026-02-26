import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemText, Paper, Divider, Button, CircularProgress, IconButton } from '@mui/material';
import { CloudUpload, DeleteOutline, ChevronLeft } from '@mui/icons-material';

const drawerWidth = 280;

export default function Sidebar({ isUploading, fileInputRef, handleFileUpload, handleClearBrain, isClearing, sessions, activeSessionId, handleSwitchSession, toggleSidebar }) {
    return (
        <Box
            sx={{
                width: drawerWidth, flexShrink: 0, height: '100vh', display: 'flex', flexDirection: 'column',
                bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider', transition: 'width 0.3s'
            }}
        >
            {/* Sidebar Header with Close Button */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'text.primary', letterSpacing: 1 }}>
                    DocuMind
                </Typography>
                <IconButton onClick={toggleSidebar} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(139, 92, 246, 0.1)' } }}>
                    <ChevronLeft />
                </IconButton>
            </Box>

            {/* Upload Dropzone */}
            <Box sx={{ p: 3 }}>
                <input type="file" accept="application/pdf" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
                <Paper
                    variant="outlined"
                    onClick={() => !isUploading && fileInputRef.current.click()}
                    sx={{
                        p: 3, textAlign: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: 'primary.main',
                        bgcolor: 'rgba(139, 92, 246, 0.05)', cursor: isUploading ? 'wait' : 'pointer',
                        opacity: isUploading ? 0.6 : 1, transition: '0.2s', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.15)' }, borderRadius: 3
                    }}
                >
                    {isUploading ? <CircularProgress size={24} sx={{ mb: 1, color: 'primary.main' }} /> : <CloudUpload sx={{ color: 'primary.main', mb: 1, fontSize: 32 }} />}
                    <Typography variant="body2" color="primary.main" fontWeight="bold">
                        {isUploading ? "Ingesting Data..." : "Upload Protocol"}
                    </Typography>
                </Paper>
            </Box>

            <Typography variant="overline" sx={{ px: 3, fontWeight: '800', color: 'secondary.main', letterSpacing: 1.5 }}>Session History</Typography>

            <List sx={{ flexGrow: 1, overflowY: 'auto', px: 2, mt: 1 }}>
                {sessions.map((session) => (
                    <ListItem key={session.id} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={session.id === activeSessionId}
                            onClick={() => handleSwitchSession(session.id)}
                            sx={{ borderRadius: 2, '&.Mui-selected': { bgcolor: 'rgba(6, 182, 212, 0.15)', borderLeft: '3px solid', borderColor: 'secondary.main' }, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
                        >
                            <ListItemText
                                primary={session.title}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: session.id === activeSessionId ? '600' : '400', color: session.id === activeSessionId ? 'secondary.main' : 'text.primary', noWrap: true }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />
            <Box sx={{ p: 2 }}>
                <Button fullWidth variant="outlined" color="error" startIcon={isClearing ? <CircularProgress size={20} color="inherit" /> : <DeleteOutline />} sx={{ textTransform: 'none', fontWeight: 'bold', borderRadius: 2, borderColor: 'rgba(244, 63, 94, 0.5)', color: '#f43f5e', '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.1)', borderColor: '#f43f5e' } }} onClick={handleClearBrain} disabled={isClearing}>
                    {isClearing ? "Purging..." : "Purge Database"}
                </Button>
            </Box>
        </Box>
    );
}