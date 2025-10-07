import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Badge,
} from '@mui/material';
import { Add as AddIcon, ShoppingCart as CartIcon } from '@mui/icons-material';
import { menuApi, MenuItem } from '../services/api';
import { useCart } from '../contexts/CartContext';
import CartDrawer from '../components/CartDrawer';

const MenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekday, setWeekday] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [specialRequests, setSpecialRequests] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [orderingWindow, setOrderingWindow] = useState<any>(null);

  const { addItem, getCartItemCount } = useCart();

  useEffect(() => {
    fetchTodaysMenu();
  }, []);

  const fetchTodaysMenu = async () => {
    try {
      setLoading(true);
      const response = await menuApi.getTodaysMenu();

      if (response.success) {
        setMenuItems(response.data.items);
        setWeekday(response.data.weekday);
        setOrderingWindow(response.data.orderingWindow);

        if (response.message) {
          setError(response.message);
        }
      } else {
        setError('Failed to load menu');
      }
    } catch (err: any) {
      console.error('Error fetching menu:', err);
      setError(err.response?.data?.message || 'Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setSelectedCustomizations([]);
    setSpecialRequests('');
  };

  const handleConfirmAddToCart = () => {
    if (selectedItem) {
      addItem(selectedItem, quantity, selectedCustomizations, specialRequests);
      setSelectedItem(null);
      setQuantity(1);
      setSelectedCustomizations([]);
      setSpecialRequests('');
    }
  };

  const handleCustomizationChange = (customization: string) => {
    setSelectedCustomizations((prev) =>
      prev.includes(customization)
        ? prev.filter((c) => c !== customization)
        : [...prev, customization]
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'info' } = {
      MAIN: 'primary',
      SIDE: 'secondary',
      DRINK: 'info',
      DESSERT: 'warning',
      OTHER: 'success',
    };
    return colors[category] || 'default';
  };

  // Group items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as { [key: string]: MenuItem[] });

  const categories = ['MAIN', 'SIDE', 'DRINK', 'DESSERT', 'OTHER'].filter(
    (cat) => groupedItems[cat]?.length > 0
  );

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Today's Menu
          </Typography>
          {weekday && (
            <Typography variant="subtitle1" color="text.secondary">
              {weekday}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="primary" size="large" onClick={() => setCartOpen(true)}>
            <Badge badgeContent={getCartItemCount()} color="error">
              <CartIcon />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {orderingWindow && !orderingWindow.active && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {orderingWindow.message || 'Ordering is currently closed'}
          {orderingWindow.window.start && orderingWindow.window.end && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Ordering window: {orderingWindow.window.start} - {orderingWindow.window.end}
            </Typography>
          )}
        </Alert>
      )}

      {menuItems.length === 0 ? (
        <Alert severity="info">No menu items available for today.</Alert>
      ) : (
        categories.map((category) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
              {category}
            </Typography>
            <Grid container spacing={3}>
              {groupedItems[category].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {item.imageUrl && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.imageUrl}
                        alt={item.name}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {item.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        {item.dietaryTags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                      <Typography variant="h6" color="primary">
                        ${Number(item.price).toFixed(2)}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to Cart
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}

      {/* Add to Cart Dialog */}
      <Dialog open={!!selectedItem} onClose={() => setSelectedItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedItem?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              InputProps={{ inputProps: { min: 1 } }}
              sx={{ mb: 3 }}
            />

            {selectedItem && selectedItem.customizations.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Customizations
                </Typography>
                <FormGroup>
                  {selectedItem.customizations.map((custom) => (
                    <FormControlLabel
                      key={custom.id}
                      control={
                        <Checkbox
                          checked={selectedCustomizations.includes(custom.customizationName)}
                          onChange={() => handleCustomizationChange(custom.customizationName)}
                        />
                      }
                      label={custom.customizationName}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}

            <TextField
              label="Special Requests"
              fullWidth
              multiline
              rows={3}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="Any special requests for this item?"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedItem(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmAddToCart}>
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </Container>
  );
};

export default MenuPage;
