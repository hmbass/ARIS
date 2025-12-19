import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        width: '100vw', 
        overflow: 'hidden',
        backgroundColor: '#0a0a0f',
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.08), transparent),
          radial-gradient(ellipse 60% 40% at 100% 100%, rgba(139, 92, 246, 0.05), transparent)
        `,
      }}
    >
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar 
        open={isMobile ? mobileOpen : true} 
        onClose={handleDrawerClose}
        isMobile={isMobile}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          minHeight: '100vh',
          maxHeight: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }} />
        <Box 
          sx={{ 
            width: '100%', 
            height: '100%',
            animation: 'fadeIn 0.4s ease',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
