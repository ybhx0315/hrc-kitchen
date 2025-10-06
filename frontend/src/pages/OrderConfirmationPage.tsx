import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: number;
  customizations: any | null;
  menuItem: {
    name: string;
    description: string | null;
    price: number;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  specialRequests: string | null;
  orderDate: string;
  createdAt: string;
  paymentId: string | null;
  orderItems: OrderItem[];
}

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrder(response.data.data);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId && token) {
      fetchOrder();
    }
  }, [orderId, token]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading order details...
        </Typography>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Order not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/menu')}>
          Back to Menu
        </Button>
      </Container>
    );
  }

  const deliveryDate = new Date(order.orderDate);
  const orderCreatedDate = new Date(order.createdAt);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Order Confirmed!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Thank you for your order. Your lunch will be prepared for{' '}
            {deliveryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Order Details
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Order Number
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {order.orderNumber}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Payment Status
              </Typography>
              <Chip
                label={order.paymentStatus.replace('_', ' ')}
                color={order.paymentStatus === 'COMPLETED' ? 'success' : 'warning'}
                size="small"
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Ordered At
              </Typography>
              <Typography variant="body1">
                {orderCreatedDate.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                ${Number(order.totalAmount).toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {order.specialRequests && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Special Requests
              </Typography>
              <Typography variant="body1">{order.specialRequests}</Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Items Ordered
          </Typography>

          <List>
            {order.orderItems.map((item) => {
              const subtotal = Number(item.priceAtPurchase) * item.quantity;
              return (
                <ListItem key={item.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={`${item.menuItem.name} × ${item.quantity}`}
                    secondary={
                      <>
                        {item.customizations?.customizations && (
                          <Typography variant="body2" color="text.secondary">
                            Customizations: {item.customizations.customizations}
                          </Typography>
                        )}
                        {item.customizations?.specialRequests && (
                          <Typography variant="body2" color="text.secondary">
                            Special Requests: {item.customizations.specialRequests}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">Total:</Typography>
            <Typography variant="h6">${Number(order.totalAmount).toFixed(2)}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate('/menu')}>
            Order Again
          </Button>
          <Button variant="contained" onClick={() => navigate('/orders')}>
            View All Orders
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmationPage;
