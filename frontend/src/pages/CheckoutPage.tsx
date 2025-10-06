import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutForm: React.FC = () => {
  const { items, clearCart, getCartTotal } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cartTotal = getCartTotal();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create order and get payment intent
      const orderData = {
        items: items.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
          customizations: item.customizations.join(', '),
          specialRequests: item.specialRequests,
        })),
        deliveryNotes: deliveryNotes || undefined,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { order, clientSecret } = response.data.data;

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Payment successful
        clearCart();
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">
          Your cart is empty. <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Checkout
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Order Summary
        </Typography>

        <List>
          {items.map(item => (
            <ListItem key={item.menuItem.id} sx={{ px: 0 }}>
              <ListItemText
                primary={`${item.menuItem.name} × ${item.quantity}`}
                secondary={
                  <>
                    {item.customizations.length > 0 && (
                      <Typography variant="body2" color="text.secondary">
                        Customizations: {item.customizations.join(', ')}
                      </Typography>
                    )}
                    {item.specialRequests && (
                      <Typography variant="body2" color="text.secondary">
                        Special Requests: {item.specialRequests}
                      </Typography>
                    )}
                  </>
                }
              />
              <Typography variant="body1">${(Number(item.menuItem.price) * item.quantity).toFixed(2)}</Typography>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h6">${cartTotal.toFixed(2)}</Typography>
        </Box>

        <TextField
          fullWidth
          label="Delivery Notes (Optional)"
          multiline
          rows={2}
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
          placeholder="e.g., Office location, special instructions..."
          sx={{ mb: 3 }}
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Payment Details
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/menu')}
              disabled={loading}
              fullWidth
            >
              Back to Menu
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={!stripe || loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : `Pay $${cartTotal.toFixed(2)}`}
            </Button>
          </Box>
        </form>
      </Paper>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Your payment information is securely processed by Stripe
        </Typography>
      </Box>
    </Container>
  );
};

const CheckoutPage: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default CheckoutPage;
