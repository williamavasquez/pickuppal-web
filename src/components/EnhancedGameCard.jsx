import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, CardContent, CardActions, Typography, 
  Button, Chip, Box, Avatar, Divider, useTheme
} from '@mui/material';
import { 
  SportsSoccer, SportsBasketball, SportsFootball, 
  SportsVolleyball, SportsTennis, SportsEsports,
  EventNote, LocationOn, Groups, AttachMoney, Info, 
  CheckCircle
} from '@mui/icons-material';

// Sport backgrounds with fallback colors - updated to use existing files
const sportBackgrounds = {
  soccer: '/images/soccer-banner.png',  // Updated to match your actual file
  basketball: '/images/basketball-banner.png',  // Updated to match your actual file
  football: '/images/soccer-banner.png',  // Fallback to soccer for now
  volleyball: '/images/basketball-banner.png',  // Fallback to basketball for now
  tennis: '/images/soccer-banner.png',  // Fallback to soccer for now
  default: '/images/soccer-banner.png'
};

// Fallback background colors by sport
const sportColors = {
  soccer: '#4caf50',  // Green
  basketball: '#ff9800', // Orange
  football: '#8d6e63', // Brown
  volleyball: '#ffeb3b', // Yellow
  tennis: '#03a9f4',  // Light Blue
  default: '#7e57c2'  // Purple
};

// Sport image positioning
const sportPositioning = {
  soccer: { top: '0', left: '0' },
  basketball: { top: '-20px', left: '0' },
  football: { top: '-10px', left: '0' },
  volleyball: { top: '-5px', left: '0' },
  tennis: { top: '-15px', left: '0' },
  default: { top: '0', left: '0' }
};

// Sport icons
const sportIcons = {
  soccer: <SportsSoccer />,
  basketball: <SportsBasketball />,
  football: <SportsFootball />,
  volleyball: <SportsVolleyball />,
  tennis: <SportsTennis />,
  default: <SportsSoccer />
};

// Helper to determine sport from game name or game.sport property
const determineSport = (game) => {
  
  // If game has explicit sport property, use it
  if (game.sport) {
    return game.sport;
  }
  
  // Otherwise infer from name
  const name = game.name?.toLowerCase() || '';
  
  if (name.includes('soccer') || name.includes('football') && !name.includes('american')) {
    return 'soccer';
  }
  if (name.includes('basketball') || name.includes('basket')) {
    return 'basketball';
  }
  if (name.includes('football') || name.includes('nfl')) {
    return 'football';
  }
  if (name.includes('volleyball') || name.includes('volley')) {
    return 'volleyball';
  }
  if (name.includes('tennis')) {
    return 'tennis';
  }
  
  return 'default';
};

const EnhancedGameCard = ({ game, onRegister, currentUser }) => {
  const theme = useTheme();
  const sport = determineSport(game);
  const bgImage = sportBackgrounds[sport] || sportBackgrounds.default;
  const sportIcon = sportIcons[sport] || sportIcons.default;
  const isDarkMode = theme.palette.mode === 'dark';
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Check if current user has already joined this game
  const hasUserJoined = React.useMemo(() => {
    if (!currentUser || !currentUser.id || !game.joinedPlayers) return false;
    return game.joinedPlayers.some(player => player.id === currentUser.id);
  }, [game.joinedPlayers, currentUser]);
  
  
  // Get positioning for this sport
  const position = sportPositioning[sport] || sportPositioning.default;
  
  // Check if the image exists
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    
    img.onerror = () => {
      console.error('Failed to load image:', bgImage);
      setImageError(true);
      setImageLoaded(false);
    };
    
    img.src = bgImage;
    
    return () => {
      // Cleanup
      img.onload = null;
      img.onerror = null;
    };
  }, [bgImage]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card 
        sx={{ 
          position: 'relative', 
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 3,
          bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
        }}
      >
        {/* Sport background with sport-specific positioning */}
        <Box
          sx={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            width: '100%',
            height: '30%',
            backgroundImage: imageError ? 'none' : `url(${bgImage})`,
            backgroundColor: imageError ? sportColors[sport] : 'transparent',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            // opacity: isDarkMode ? 0.5 : 0.7,
            zIndex: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {imageError && (
            <Box sx={{ color: 'white', fontSize: '2rem' }}>
              {sportIcon}
            </Box>
          )}
        </Box>
        
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 1,
          backgroundColor: isDarkMode ? 'rgba(40,40,40,0.8)' : 'rgba(255,255,255,0.8)',
          borderRadius: '50%',
          padding: '5px'
        }}>
          {sportIcon}
        </Box>
        
        <CardContent sx={{ 
          position: 'relative', 
          zIndex: 1, 
          backgroundColor: isDarkMode ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)',
          mt: '25%',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          pt: 3,
          flexGrow: 1
        }}>
          <Typography variant="h5" component="div" fontWeight="bold" gutterBottom>
            {game.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, mt: 2 }}>
            <EventNote sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body1">
              {game.date} {game.time && `at ${game.time}`}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body1">
              {game.location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Groups sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body1">
              {game.joinedPlayers?.length || 0}/{game.players} players
            </Typography>
          </Box>
          
          {game.hasFee && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="body1">
                ${game.fee.toFixed(2)}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={game.hasFee ? `$${game.fee.toFixed(2)}` : "Free to Join"} 
              color={game.hasFee ? "primary" : "success"} 
              size="small"
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`${game.joinedPlayers?.length || 0}/${game.players} Joined`} 
              color="secondary" 
              size="small" 
              sx={{ mr: 1 }}
            />
          </Box>
        </CardContent>
        
        <Divider />
        
        <CardActions sx={{ bgcolor: 'background.paper', p: 2 }}>
          {hasUserJoined ? (
            <Button 
              variant="contained" 
              fullWidth 
              color="success"
              disabled
              startIcon={<CheckCircle />}
              sx={{ 
                opacity: 0.9, 
                '&.Mui-disabled': { 
                  color: 'white',
                  backgroundColor: theme.palette.success.main 
                } 
              }}
            >
              Already Registered
            </Button>
          ) : (
            <Button 
              variant="contained" 
              fullWidth 
              color="primary"
              onClick={() => onRegister(game)}
              startIcon={<Info />}
            >
              Register
            </Button>
          )}
        </CardActions>
      </Card>
    </motion.div>
  );
};

export default EnhancedGameCard; 