// src/components/Navbar.tsx

import { Group, Button, Box, Text } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export const Navbar = () => {
  // THIS IS THE CORRECTED PART
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <Box
      component="header"
      p="md"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Text size="xl" fw={700} component={Link} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        SkillConnect
      </Text>
      <Group>
        {isAuthenticated ? (
          <>
            <Text component={Link} to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                Welcome, {user?.email}
            </Text> 
            <Button variant="outline" component={Link} to="/chat">
                Chat
            </Button>
            <Button variant="outline" component={Link} to="/dashboard">
              Dashboard
            </Button>
            <Button variant="filled" color="red" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button variant="default" component={Link} to="/login">
              Log In
            </Button>
            <Button variant="filled" component={Link} to="/register">
              Sign Up
            </Button>
          </>
        )}
      </Group>
    </Box>
  );
};
