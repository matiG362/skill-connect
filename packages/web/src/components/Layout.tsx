// src/components/Layout.tsx
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Box } from '@mantine/core';
import { Chatbot } from './Chatbot'; 
export const Layout = () => {
  return (
    <Box>
      <Navbar />
      <main>
        {/* The Outlet will render the specific page component for the current route */}
        <Outlet />
      </main>
      <Chatbot />
    </Box>
  );
};
