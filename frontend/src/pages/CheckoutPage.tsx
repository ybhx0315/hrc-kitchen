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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutForm: React.FC = () => {
  const { items, clearCart, getCartTotal, calculateItemPrice } = useCart();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guest checkout fields
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Email exists dialog
  const [showEmailExistsDialog, setShowEmailExistsDialog] = useState(false);

  const cartTotal = getCartTotal();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate guest info if not authenticated
    if (!isAuthenticated) {
      if (!guestFirstName || !guestLastName || !guestEmail) {
        setError('Please fill in all guest information fields');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        setError('Please enter a valid email address');
        return;
      }
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
          selectedVariations: item.selectedVariations || [],
        })),
        deliveryNotes: deliveryNotes || undefined,
      };

      let response;
      if (isAuthenticated) {
        // Authenticated order
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/orders`,
          orderData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Guest order
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/orders/guest`,
          {
            ...orderData,
            guestInfo: {
              firstName: guestFirstName,
              lastName: guestLastName,
              email: guestEmail,
            },
          }
        );
      }

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
        navigate(`/order-confirmation/${order.id}`, {
          state: {
            isGuest: !isAuthenticated,
            guestEmail: guestEmail || undefined,
            guestName: `${guestFirstName} ${guestLastName}` || undefined
          }
        });
      }
    } catch (err: any) {
      console.error('Checkout error:', err);

      // Check if error is due to existing email
      if (err.response?.data?.code === 'EMAIL_EXISTS') {
        setShowEmailExistsDialog(true);
        setError(null);
      } else {
        setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignInFromDialog = () => {
    setShowEmailExistsDialog(false);
    navigate('/login', { state: { from: '/checkout' } });
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
            <ListItem key={item.menuItem.id} sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1" fontWeight="bold">
                  {item.menuItem.name} × {item.quantity}
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  ${(calculateItemPrice(item) * item.quantity).toFixed(2)}
                </Typography>
              </Box>

              <Box sx={{ width: '100%', pl: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  ${calculateItemPrice(item).toFixed(2)} each
                </Typography>

                {/* Display selected variations */}
                {item.selectedVariations && item.selectedVariations.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {item.selectedVariations.map((selection) => {
                      const group = item.menuItem.variationGroups?.find(
                        (g) => g.id === selection.groupId
                      );
                      if (!group) return null;

                      const selectedOptions = selection.optionIds
                        .map((optionId) => group.options.find((o) => o.id === optionId))
                        .filter(Boolean);

                      return (
                        <Typography key={selection.groupId} variant="body2" color="text.secondary">
                          • {group.name}: {selectedOptions.map((opt) =>
                            `${opt!.name}${opt!.priceModifier !== 0 ? ` (+$${Number(opt!.priceModifier).toFixed(2)})` : ''}`
                          ).join(', ')}
                        </Typography>
                      );
                    })}
                  </Box>
                )}

                {item.customizations.length > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    • Customizations: {item.customizations.join(', ')}
                  </Typography>
                )}
                {item.specialRequests && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    • Special Requests: {item.specialRequests}
                  </Typography>
                )}
              </Box>
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
          {!isAuthenticated ? 'Your Information' : 'Payment Details'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Guest Information Form */}
          {!isAuthenticated && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Please provide your information to complete the order
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Already have an account?{' '}
                <Box
                  component="span"
                  onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                  sx={{
                    color: 'primary.main',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontWeight: 500,
                    '&:hover': {
                      color: 'primary.dark',
                    }
                  }}
                >
                  Sign In
                </Box>
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <TextField
                  required
                  label="First Name"
                  value={guestFirstName}
                  onChange={(e) => setGuestFirstName(e.target.value)}
                  disabled={loading}
                />
                <TextField
                  required
                  label="Last Name"
                  value={guestLastName}
                  onChange={(e) => setGuestLastName(e.target.value)}
                  disabled={loading}
                />
              </Box>
              <TextField
                required
                fullWidth
                type="email"
                label="Email Address"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                disabled={loading}
                helperText="You'll receive order confirmation and receipt at this email"
                sx={{ mb: 2 }}
              />
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
            </Box>
          )}

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

      {/* Email Exists Dialog */}
      <Dialog open={showEmailExistsDialog} onClose={() => setShowEmailExistsDialog(false)}>
        <DialogTitle>Account Already Exists</DialogTitle>
        <DialogContent>
          <Typography>
            An account with the email <strong>{guestEmail}</strong> already exists.
            Please sign in to continue with your order.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEmailExistsDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSignInFromDialog}>
            Sign In
          </Button>
        </DialogActions>
      </Dialog>
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
