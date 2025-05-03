'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, Container, Typography, TextField, InputAdornment, 
  Button, Paper, Grid, FormControl, FormLabel, RadioGroup,
  FormControlLabel, Radio, Select, MenuItem, Divider,
  CircularProgress, IconButton, Slide, Fade
} from '@mui/material';
import { 
  FilterList, Search, Close, Refresh, 
  SportsSoccer, SportsBasketball
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import EnhancedGameCard from '@/components/EnhancedGameCard';
import styles from './search.module.css';
import PaymentModal from '@/components/PaymentModal';

// Create a custom theme that works with the existing dark mode
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4f46e5',
    },
    secondary: {
      main: '#818cf8',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

// Theme for dark mode
const darkTheme = createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    mode: 'dark',
    primary: {
      main: '#6366f1',
    },
  },
  components: {
    ...theme.components,
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.9) !important',
          fontSize: '0.9rem',
          fontWeight: 500,
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: 'white',
        }
      }
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: 'rgba(255, 255, 255, 0.7)',
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        root: {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
          },
        }
      }
    }
  }
});

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [showFilters, setShowFilters] = useState(true);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Filter states
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [dates, setDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [playerCounts, setPlayerCounts] = useState([]);
    const [selectedPlayerCount, setSelectedPlayerCount] = useState('');
    const [hasFee, setHasFee] = useState(null);

    // Add new state for payment modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);

    const router = useRouter();

    // Check dark mode preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mediaQuery.matches);
        
        const handler = (e) => setIsDarkMode(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Load games on initial render
    useEffect(() => {
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        // Get user info
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);

        // Load games from localStorage
        const savedGames = localStorage.getItem('games');

        if (savedGames) {
            const allGames = JSON.parse(savedGames);

            // Important: Print individual games to debug
            allGames.forEach((game, index) => {
            });

            setGames(allGames);

            // Extract unique values for filters
            const uniqueLocations = [...new Set(allGames.map(game => game.location))];
            const uniqueDates = [...new Set(allGames.map(game => game.date))];
            const uniquePlayerCounts = [...new Set(allGames.map(game => game.players))].sort((a, b) => a - b);

            setLocations(uniqueLocations);
            setDates(uniqueDates);
            setPlayerCounts(uniquePlayerCounts);

            // Show ALL games by default, not just public ones
            setFilteredGames(allGames);
        } else {
            // If no games exist yet, initialize with empty array
            setFilteredGames([]);
        }

        setLoading(false);
    }, [router]);

    // Apply filters when filter criteria change - but not on initial load
    useEffect(() => {
        // Only apply filters if the games array has been populated
        if (games.length > 0) {
            applyFilters();
        }
    }, [searchQuery, selectedLocation, selectedDate, selectedPlayerCount, hasFee, games]);

    const applyFilters = () => {
        let results = [...games];

        // Apply search query filter (fuzzy search across multiple fields)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(game =>
                game.name?.toLowerCase().includes(query) ||
                game.location?.toLowerCase().includes(query) ||
                game.date?.toLowerCase().includes(query)
            );
        }

        // Apply location filter
        if (selectedLocation) {
            results = results.filter(game => game.location === selectedLocation);
        }

        // Apply date filter
        if (selectedDate) {
            results = results.filter(game => game.date === selectedDate);
        }

        // Apply player count filter
        if (selectedPlayerCount) {
            results = results.filter(game => game.players === parseInt(selectedPlayerCount));
        }

        // Apply fee filter
        if (hasFee !== null) {
            results = results.filter(game => game.hasFee === hasFee);
        }

        setFilteredGames(results);
    };

    const resetFilters = () => {
        setSelectedLocation('');
        setSelectedDate('');
        setSelectedPlayerCount('');
        setHasFee(null);
        setSearchQuery('');
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleBookGame = (game) => {
        // If user is not logged in, redirect to login
        if (!user) {
            router.push('/login');
            return;
        }
        
        // Check if user has already joined
        if (game.joinedPlayers && game.joinedPlayers.some(player => player.id === user.id)) {
            // Could show a notification here
            return;
        }
        
        // For free games, register immediately instead of redirecting
        if (!game.hasFee || game.fee <= 0) {
            // Create a new player object
            const newPlayer = {
                id: user.id,
                name: user.name || 'Player',
                joinedDate: new Date().toISOString().split('T')[0],
                hasPaid: true
            };
            
            // Update games in localStorage
            const savedGames = localStorage.getItem('games');
            if (savedGames) {
                const allGames = JSON.parse(savedGames);
                
                // Update the specific game with the new player
                const updatedGames = allGames.map(g => {
                    if (g.id === game.id) {
                        // Make sure joinedPlayers is an array
                        const joinedPlayers = g.joinedPlayers || [];
                        
                        // Add player if they're not already registered
                        if (!joinedPlayers.some(player => player.id === newPlayer.id)) {
                            return {
                                ...g,
                                joinedPlayers: [...joinedPlayers, newPlayer]
                            };
                        }
                    }
                    return g;
                });
                
                // Save updated games back to localStorage
                localStorage.setItem('games', JSON.stringify(updatedGames));
                
                // Refresh the games list
                setFilteredGames(updatedGames);
                
                // Show a success message or notification
                alert('Successfully registered for the game!');
                
                // Optionally redirect to player dashboard
                router.push('/player-dashboard');
            }
        } else {
            // For paid games, show payment modal
            setSelectedGame(game);
            setShowPaymentModal(true);
        }
    };

    const handlePaymentComplete = () => {
        // After payment is complete, add user to game's joined players
        const newPlayer = {
            id: user.id,
            name: user.name || 'Player',
            joinedDate: new Date().toISOString().split('T')[0],
            hasPaid: true
        };
        
        // Update games in localStorage
        const savedGames = localStorage.getItem('games');
        if (savedGames && selectedGame) {
            const allGames = JSON.parse(savedGames);
            
            // Update the specific game with the new player
            const updatedGames = allGames.map(game => {
                if (game.id === selectedGame.id) {
                    // Make sure joinedPlayers is an array
                    const joinedPlayers = game.joinedPlayers || [];
                    
                    // Add player if they're not already registered
                    if (!joinedPlayers.some(player => player.id === newPlayer.id)) {
                        return {
                            ...game,
                            joinedPlayers: [...joinedPlayers, newPlayer]
                        };
                    }
                }
                return game;
            });
            
            // Save updated games back to localStorage
            localStorage.setItem('games', JSON.stringify(updatedGames));
            
            // Redirect to player dashboard
            router.push('/player-dashboard');
        }
    };

    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : theme}>
            <div className={styles.pageContainer}>
                <div className={styles.navbarWrapper}>
                    <Navbar />
                </div>
                <div className={styles.content}>
                    <Box className={styles.searchHero} sx={{ 
                        background: 'linear-gradient(to right, #4f46e5, #818cf8)',
                        py: 5
                    }}>
                        <Container maxWidth="lg">
                            <Fade in={true} timeout={800}>
                                <Box className={styles.searchHeroContent} sx={{ textAlign: 'center' }}>
                                    <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                                        Find Games Near You
                                    </Typography>
                                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                                        Search by location, date, or other criteria and book your next game
                                    </Typography>

                                    <Box sx={{ 
                                        maxWidth: 600, 
                                        margin: '0 auto',
                                        position: 'relative',
                                        display: 'flex'
                                    }}>
                                        <TextField
                                            fullWidth
                                            placeholder="Search games by name, location..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            sx={{ 
                                                bgcolor: 'white',
                                                borderRadius: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    pr: 0.5,
                                                }
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton sx={{ color: 'primary.main' }}>
                                                            <Search />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Fade>
                        </Container>
                    </Box>

                    <Container maxWidth="lg" sx={{ py: 4 }}>
                        <Button
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={toggleFilters}
                            sx={{ display: { xs: 'flex', md: 'none' }, mb: 2 }}
                        >
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </Button>
                        
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <Slide direction="right" in={showFilters} mountOnEnter unmountOnExit>
                                <Paper 
                                    sx={{ 
                                        p: 3, 
                                        width: { xs: '100%', md: 280 },
                                        height: 'fit-content',
                                        position: { md: 'sticky' },
                                        top: { md: 80 }
                                    }} 
                                    elevation={3}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
                                        <Typography variant="h6" component="h2" fontWeight="bold">
                                            Filters
                                        </Typography>
                                        <IconButton 
                                            size="small" 
                                            onClick={resetFilters}
                                            color="primary"
                                        >
                                            <Refresh />
                                        </IconButton>
                                    </Box>
                                    
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <FormLabel>Location</FormLabel>
                                        <Select
                                            value={selectedLocation}
                                            onChange={(e) => setSelectedLocation(e.target.value)}
                                            displayEmpty
                                            fullWidth
                                            size="small"
                                            sx={{ mt: 1, color: 'white' }}
                                        >
                                            <MenuItem value="">All Locations</MenuItem>
                                            {locations.map(location => (
                                                <MenuItem key={location} value={location}>{location}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <FormLabel>Date</FormLabel>
                                        <Select
                                            value={selectedDate}
                                            onChange={(e) => setSelectedDate(e.target.value)}
                                            displayEmpty
                                            fullWidth
                                            size="small"
                                            sx={{ mt: 1, color: 'white' }}
                                        >
                                            <MenuItem value="">All Dates</MenuItem>
                                            {dates.map(date => (
                                                <MenuItem key={date} value={date}>{date}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <FormLabel>Player Count</FormLabel>
                                        <Select
                                            value={selectedPlayerCount}
                                            onChange={(e) => setSelectedPlayerCount(e.target.value)}
                                            displayEmpty
                                            fullWidth
                                            size="small"
                                            sx={{ mt: 1, color: 'white' }}
                                        >
                                            <MenuItem value="">Any Size</MenuItem>
                                            {playerCounts.map(count => (
                                                <MenuItem key={count} value={count}>{count} players</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <FormLabel>Fee</FormLabel>
                                        <RadioGroup 
                                            value={hasFee === null ? 'any' : hasFee ? 'hasFee' : 'free'}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setHasFee(value === 'any' ? null : value === 'hasFee');
                                            }}
                                        >
                                            <FormControlLabel value="any" control={<Radio size="small" />} label="Any" />
                                            <FormControlLabel value="hasFee" control={<Radio size="small" />} label="Has Fee" />
                                            <FormControlLabel value="free" control={<Radio size="small" />} label="Free" />
                                        </RadioGroup>
                                    </FormControl>
                                    
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        onClick={resetFilters}
                                        startIcon={<Refresh />}
                                    >
                                        Clear All Filters
                                    </Button>
                                </Paper>
                            </Slide>
                            
                            <Box sx={{ flexGrow: 1 }}>
                                <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h5" component="h2" fontWeight="bold">
                                            Available Games
                                        </Typography>
                                        <Typography variant="body2" >
                                            Showing {filteredGames.length} results
                                        </Typography>
                                    </Box>
                                </Paper>
                                
                                {loading ? (
                                    <Box sx={{ textAlign: 'center', py: 6 }}>
                                        <CircularProgress size={50} />
                                        <Typography sx={{ mt: 2 }}>Loading games...</Typography>
                                    </Box>
                                ) : filteredGames.length > 0 ? (
                                    <Grid container spacing={3}>
                                        {filteredGames.map((game) => (
                                            <Grid item xs={12} sm={6} md={4} key={game.id}>
                                                <EnhancedGameCard 
                                                    game={game} 
                                                    onRegister={() => handleBookGame(game)}
                                                    currentUser={user}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Paper sx={{ 
                                        textAlign: 'center', 
                                        py: 6, 
                                        px: 3,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                    }}>
                                        <Search sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                                        <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                                            No games found
                                        </Typography>
                                        <Typography >
                                            Try adjusting your filters or search criteria
                                        </Typography>
                                    </Paper>
                                )}
                            </Box>
                        </Box>
                    </Container>
                </div>
            </div>

            {/* Add the PaymentModal component */}
            <PaymentModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                game={selectedGame}
                onPaymentComplete={handlePaymentComplete}
                user={user}
            />
        </ThemeProvider>
    );
} 