import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Fade,
  IconButton,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  Chip,
  Stepper,
  Step,
  StepLabel,
  useTheme,
  Slide,
  InputAdornment
} from '@mui/material';
import {
  Close,
  CreditCard,
  PaymentOutlined,
  CheckCircleOutline,
  EventNote,
  LocationOn,
  Groups,
  SportsScore
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Custom styled components
const PaymentMethodButton = styled(Paper)(({ theme, selected }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: selected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  backgroundColor: selected ? 
    (theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)') : 
    (theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : theme.palette.background.paper),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(0, 0, 0, 0.02)',
    transition: 'all 0.2s',
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    },
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(0, 0, 0, 0.04)',
    }
  },
  '& .MuiOutlinedInput-input': {
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.87)',
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
  },
}));

const CardNumberField = styled(StyledTextField)(({ theme }) => ({
  letterSpacing: '1px',
  fontFeatureSettings: '"tnum"',
  '& input': {
    letterSpacing: '1px',
  }
}));

const PaymentModal = ({ 
  open, 
  onClose, 
  game, 
  onPaymentComplete, 
  user 
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Ensure game exists before attempting to render
  if (!game && open) {
    return (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: isDarkMode ? 'white' : 'text.primary' }}>
            Loading game details...
          </Typography>
          <CircularProgress sx={{ mt: 2 }} />
        </Box>
      </Dialog>
    );
  }
  
  // Card type detection
  const getCardType = (number) => {
    if (number.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (number.startsWith('3')) return 'amex';
    if (number.startsWith('6')) return 'discover';
    return 'unknown';
  };
  
  const cardType = getCardType(cardNumber);
  
  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    // Different formatting for Amex vs other cards
    if (getCardType(v) === 'amex') {
      const matches = v.match(/\d{1,4}/g);
      return matches ? matches.join(' ').substring(0, 17) : '';
    } else {
      const matches = v.match(/\d{1,4}/g);
      return matches ? matches.join(' ').substring(0, 19) : '';
    }
  };
  
  // Format expiry date with slash
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };
  
  const resetForm = () => {
    setCardNumber('');
    setCardName('');
    setCardExpiry('');
    setCardCvc('');
    setPaymentError('');
    setPaymentMethod('credit');
    setIsProcessingPayment(false);
    setPaymentSuccess(false);
  };
  
  const handleClose = () => {
    if (isProcessingPayment) return;
    resetForm();
    onClose();
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate payment form
    if (paymentMethod === 'credit') {
      const cleanedCardNumber = cardNumber.replace(/\s+/g, '');
      
      if (!cleanedCardNumber || !cardName || !cardExpiry || !cardCvc) {
        setPaymentError('All fields are required');
        return;
      }
      
      if (cleanedCardNumber.length < 15) {
        setPaymentError('Invalid card number');
        return;
      }
      
      if (cardExpiry.length < 5) {
        setPaymentError('Invalid expiration date');
        return;
      }
      
      if (cardCvc.length < 3) {
        setPaymentError('Invalid security code');
        return;
      }
    }
    
    // Process payment
    setIsProcessingPayment(true);
    setPaymentError('');
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      
      // Notify parent after success
      setTimeout(() => {
        onPaymentComplete();
        handleClose();
      }, 2000);
    }, 2000);
  };
  
  // Don't render the full component if game is null
  if (!game) return null;
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      {/* Custom styled header */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: 2,
          px: 3,
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {paymentSuccess ? 'Payment Complete' : 'Payment Details'}
        </Typography>
        {!isProcessingPayment && (
          <IconButton onClick={handleClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        )}
      </Box>
      
      <DialogContent sx={{ p: 0 }}>
        {/* Loading state */}
        {isProcessingPayment && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              py: 8
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3, fontWeight: 500 }}>
              Processing your payment...
            </Typography>
            <Typography variant="body2"  sx={{ mt: 1 }}>
              Please don't close this window
            </Typography>
          </Box>
        )}
        
        {/* Success state */}
        {paymentSuccess && game && (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              py: 6
            }}
          >
            <CheckCircleOutline sx={{ fontSize: 70, color: 'success.main' }} />
            <Typography variant="h5" sx={{ mt: 3, fontWeight: 600 }}>
              Payment Successful!
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, textAlign: 'center' }}>
              You are now registered for {game.name}
            </Typography>
            
            <Box 
              sx={{ 
                mt: 4, 
                p: 2, 
                bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderRadius: 2,
                width: '100%',
                maxWidth: 400
              }}
            >
              <Typography variant="subtitle2"  gutterBottom>
                Game Details:
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EventNote sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2">
                  {game.date} {game.time && `at ${game.time}`}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2">
                  {game.location}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Groups sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                <Typography variant="body2">
                  {(game.joinedPlayers?.length || 0) + 1}/{game.players} players
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
        
        {/* Payment form */}
        {!isProcessingPayment && !paymentSuccess && game && (
          <Box sx={{ p: 3 }}>
            {/* Game summary */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 3,
                pb: 3,
                borderBottom: 1,
                borderColor: 'divider'
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {game.name}
                </Typography>
                <Typography variant="body2" >
                  {game.date} {game.time && `at ${game.time}`} • {game.location}
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                ${game.fee ? game.fee.toFixed(2) : '0.00'}
              </Typography>
            </Box>
            
            {/* Payment method selection */}
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Select Payment Method
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <PaymentMethodButton 
                selected={paymentMethod === 'credit'}
                onClick={() => setPaymentMethod('credit')}
                elevation={paymentMethod === 'credit' ? 2 : 0}
              >
                <CreditCard  />
                <Typography>Credit Card</Typography>
              </PaymentMethodButton>
              
              <PaymentMethodButton 
                selected={paymentMethod === 'paypal'}
                onClick={() => setPaymentMethod('paypal')}
                elevation={paymentMethod === 'paypal' ? 2 : 0}
              >
                <span style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>P</span>
                <Typography>PayPal</Typography>
              </PaymentMethodButton>
            </Box>
            
            {/* Error message */}
            {paymentError && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {paymentError}
              </Typography>
            )}
            
            {/* Payment form */}
            <form onSubmit={handleSubmit}>
              {paymentMethod === 'credit' ? (
                <>
                  <CardNumberField
                    label="Card Number"
                    fullWidth
                    variant="outlined"
                    value={formatCardNumber(cardNumber)}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    sx={{ mb: 2 }}
                    InputProps={{
                      endAdornment: cardType !== 'unknown' && (
                        <Box component="span" sx={{ fontSize: '0.85rem', letterSpacing: 0 }}>
                          {cardType.toUpperCase()}
                        </Box>
                      )
                    }}
                  />
                  
                  <StyledTextField
                    label="Cardholder Name"
                    fullWidth
                    variant="outlined"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Smith"
                    sx={{ mb: 2 }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <StyledTextField
                      label="Expiry Date"
                      variant="outlined"
                      value={formatExpiryDate(cardExpiry)}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      sx={{ mb: 2, flex: 1 }}
                      inputProps={{ maxLength: 5 }}
                    />
                    
                    <StyledTextField
                      label="CVC"
                      variant="outlined"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                      placeholder="123"
                      sx={{ mb: 2, flex: 1 }}
                      inputProps={{ maxLength: 4 }}
                    />
                  </Box>
                </>
              ) : (
                <Box sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  borderRadius: 2,
                  mb: 2
                }}>
                  <Typography variant="body1" paragraph>
                    You'll be redirected to PayPal to complete your payment.
                  </Typography>
                  <Typography variant="body2" >
                    Please make sure pop-ups are allowed in your browser.
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleClose}
                  disabled={isProcessingPayment}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  
                  type="submit"
                  disabled={isProcessingPayment}
                  sx={{ px: 4 }}
                >
                  Pay ${game && game.fee ? game.fee.toFixed(2) : '0.00'}
                </Button>
              </Box>
            </form>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal; 