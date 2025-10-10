import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}>
            HRC Kitchen
          </Typography>

          {isAuthenticated ? (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {user?.fullName} ({user?.role})
              </Typography>
              <Button color="inherit" component={Link} to="/menu">
                Menu
              </Button>
              <Button color="inherit" component={Link} to="/orders">
                Orders
              </Button>
              {user?.role === 'KITCHEN' || user?.role === 'ADMIN' ? (
                <Button color="inherit" component={Link} to="/kitchen">
                  Kitchen
                </Button>
              ) : null}
              {user?.role === 'ADMIN' ? (
                <>
                  <Button color="inherit" component={Link} to="/admin">
                    Admin
                  </Button>
                  <Button color="inherit" component={Link} to="/reports">
                    Reports
                  </Button>
                </>
              ) : null}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: '#f5f5f5' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © 2025 HRC Kitchen - Huon Regional Care
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
