import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MenuPage from './pages/MenuPage';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/menu" element={<MenuPage />} />
              {/* TODO: Add remaining routes */}
              {/* <Route path="/checkout" element={<CheckoutPage />} /> */}
              {/* <Route path="/orders" element={<OrdersPage />} /> */}
              {/* <Route path="/kitchen" element={<KitchenDashboard />} /> */}
              {/* <Route path="/admin" element={<AdminDashboard />} /> */}
            </Routes>
          </Container>
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
