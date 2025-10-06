import { Typography, Paper, Box } from '@mui/material';

const HomePage = () => {
  return (
    <Box>
      <Typography variant="h3" gutterBottom>
        Welcome to HRC Kitchen
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          Lunch Ordering System for Huon Regional Care Staff
        </Typography>

        <Typography variant="body1" paragraph>
          HRC Kitchen makes it easy to order your daily lunch. Browse our rotating weekly menu,
          place your order during the ordering window, and enjoy freshly prepared meals.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          How it works:
        </Typography>

        <Typography component="ol" sx={{ pl: 3 }}>
          <li>Register or log in to your account</li>
          <li>View today's menu during the ordering window (8:00 AM - 10:30 AM)</li>
          <li>Add items to your cart and customize as needed</li>
          <li>Complete payment securely with your credit card</li>
          <li>Receive your order confirmation</li>
          <li>Pick up your meal when ready!</li>
        </Typography>
      </Paper>
    </Box>
  );
};

export default HomePage;
