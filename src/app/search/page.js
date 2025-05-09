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
// import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { MaterialReactTable } from 'material-react-table';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Custom wrapper for EnhancedGameCard that adds our needed features
const CustomGameCard = ({ game, userIsRegistered, onRegister, currentUser }) => {
    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Game info section */}
            <Box>
                <Typography variant="h6" fontWeight="bold">{game.name}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    {game.date} {game.time && `at ${game.time}`}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Location:</strong> {game.location}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Players:</strong> {game.joined_players?.length || 0}/{game.players}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Fee:</strong> {game.has_fee && game.fee > 0 ? `$${game.fee.toFixed(2)}` : 'Free'}
                </Typography>
                
                {game.notes && (
                    <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                        {game.notes}
                    </Typography>
                )}
            </Box>
            
            {/* Button section */}
            <Box sx={{ mt: 'auto', pt: 2 }}>
                {userIsRegistered ? (
                    <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        disabled
                    >
                        Already Registered
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={onRegister}
                    >
                        {game.has_fee && game.fee > 0 ? `Register ($${game.fee.toFixed(2)})` : 'Register (Free)'}
                    </Button>
                )}
            </Box>
        </Paper>
    );
};

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

    // Load games from Supabase instead of localStorage
    useEffect(() => {
        // Check if user is logged in (keeping existing localStorage auth)
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        // Get user info (keeping existing localStorage user)
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);

        // Load games from Supabase instead of localStorage
        const loadGamesFromSupabase = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('games')
                    .select('*');

                if (error) {
                    console.error('Error loading games:', error);
                    setFilteredGames([]);
                    setLoading(false);
                    return;
                }

                if (data) {
                    setGames(data);

                    // Extract unique values for filters
                    const uniqueLocations = [...new Set(data.map(game => game.location))];
                    const uniqueDates = [...new Set(data.map(game => game.date))];
                    const uniquePlayerCounts = [...new Set(data.map(game => game.players))].sort((a, b) => a - b);

                    setLocations(uniqueLocations);
                    setDates(uniqueDates);
                    setPlayerCounts(uniquePlayerCounts);

                    // Show ALL games by default
                    setFilteredGames(data);
                } else {
                    setFilteredGames([]);
                }
            } catch (err) {
                console.error('Error:', err);
                setFilteredGames([]);
            }
            setLoading(false);
        };

        loadGamesFromSupabase();
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
        console.log("Applying filters to games:", JSON.stringify({
            totalGames: games.length,
            searchQuery,
            selectedLocation,
            selectedDate,
            selectedPlayerCount,
            hasFee
        }));

        // Apply search query filter
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

        // Apply fee filter - fix to use has_fee property
        if (hasFee !== null) {
            results = results.filter(game => game.has_fee === hasFee);
            console.log(`Filtered by fee (hasFee=${hasFee}):`, results.length);
        }

        console.log("Filter results:", {
            resultCount: results.length
        });
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

    const handleBookGame = async (game) => {
        console.log("handleBookGame called with game:", {
            id: game.id,
            name: game.name,
            hasFee: game.has_fee,
            fee: game.fee,
            joined_players: game.joined_players
        });

        // If user is not logged in, redirect to login
        if (!user) {
            console.log("No user logged in, redirecting to login");
            router.push('/login');
            return;
        }
        
        // Check if user has already joined
        if (game.joined_players && game.joined_players.some(player => player.id === user.id)) {
            console.log(`User ${user.id} already registered for game ${game.id}`);
            alert('You have already registered for this game');
            return;
        }
        
        // For free games, register immediately
        if (!game.has_fee || game.fee <= 0) {
            console.log(`Registering for free game ${game.id}`);
            // Create a new player object
            const newPlayer = {
                id: user.id,
                name: user.name || 'Player',
                joinedDate: new Date().toISOString().split('T')[0],
                hasPaid: true
            };
            
            try {
                // First get the most current version of the game
                const { data: currentGame, error: fetchError } = await supabase
                    .from('games')
                    .select('*')
                    .eq('id', game.id)
                    .single();
                
                if (fetchError) {
                    console.error('Error fetching game:', fetchError);
                    alert('Error registering for game. Please try again.');
                    return;
                }
                
                // Make sure joined_players is an array
                const joinedPlayers = Array.isArray(currentGame.joined_players) 
                    ? currentGame.joined_players 
                    : [];
                
                // Add player if they're not already registered
                if (!joinedPlayers.some(player => player.id === newPlayer.id)) {
                    const updatedPlayers = [...joinedPlayers, newPlayer];
                    
                    // Update the game in Supabase
                    const { error: updateError } = await supabase
                        .from('games')
                        .update({ joined_players: updatedPlayers })
                        .eq('id', game.id);
                    
                    if (updateError) {
                        console.error('Error updating game:', updateError);
                        alert('Error registering for game. Please try again.');
                        return;
                    }
                    
                    // Show a success message
                    alert('Successfully registered for the game!');
                    
                    // Refresh the game list to reflect changes
                    await refreshGameList();
                }
            } catch (err) {
                console.error('Error:', err);
                alert('An unexpected error occurred. Please try again.');
            }
        } else {
            console.log(`Opening payment modal for game with fee: $${game.fee}`);
            // For paid games, show payment modal
            setSelectedGame(game);
            setShowPaymentModal(true);
        }
    };

    const handlePaymentComplete = async () => {
        if (!selectedGame || !user) return;
        
        // After payment is complete, add user to game's joined players
        const newPlayer = {
            id: user.id,
            name: user.name || 'Player',
            joinedDate: new Date().toISOString().split('T')[0],
            hasPaid: true
        };
        
        try {
            // First get the most current version of the game
            const { data: currentGame, error: fetchError } = await supabase
                .from('games')
                .select('*')
                .eq('id', selectedGame.id)
                .single();
            
            if (fetchError) {
                console.error('Error fetching game:', fetchError);
                alert('Error registering for game. Please try again.');
                return;
            }
            
            // Make sure joined_players is an array
            const joinedPlayers = Array.isArray(currentGame.joined_players) 
                ? currentGame.joined_players 
                : [];
            
            // Add player if they're not already registered
            if (!joinedPlayers.some(player => player.id === newPlayer.id)) {
                const updatedPlayers = [...joinedPlayers, newPlayer];
                
                // Update the game in Supabase
                const { error: updateError } = await supabase
                    .from('games')
                    .update({ joined_players: updatedPlayers })
                    .eq('id', selectedGame.id);
                
                if (updateError) {
                    console.error('Error updating game:', updateError);
                    alert('Error registering for game. Please try again.');
                    return;
                }
                
                // Refresh the game list to reflect changes
                await refreshGameList();
                
                // Redirect to player dashboard
                router.push('/dashboard');
            }
        } catch (err) {
            console.error('Error:', err);
            alert('An unexpected error occurred. Please try again.');
        }
    };

    // Update the isUserRegistered function with more logging
    const isUserRegistered = (game) => {
        console.log(`Checking if user ${user?.id} is registered for game ${game.id}:`, JSON.stringify({
            hasJoinedPlayers: !!game.joined_players,
            isArray: Array.isArray(game.joined_players),
            joinedPlayers: game.joined_players,
            userId: user?.id
        }));
        
        if (!game.joined_players || !Array.isArray(game.joined_players) || !user) {
            return false;
        }
        
        const isRegistered = game.joined_players.some(player => player.id === user.id);
        console.log(`User ${user.id} registered for game ${game.id}: ${isRegistered}`);
        return isRegistered;
    };

    // Add this function to refresh the game list when registration changes
    const refreshGameList = async () => {
        console.log("Refreshing game list after registration change");
        try {
            const { data, error } = await supabase
                .from('games')
                .select('*');

            if (error) {
                console.error('Error refreshing games:', error);
                return;
            }

            if (data) {
                setGames(data);
                
                // Reapply existing filters to the updated data
                let filtered = [...data];
                
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    filtered = filtered.filter(game =>
                        game.name?.toLowerCase().includes(query) ||
                        game.location?.toLowerCase().includes(query) ||
                        game.date?.toLowerCase().includes(query)
                    );
                }
                
                if (selectedLocation) {
                    filtered = filtered.filter(game => game.location === selectedLocation);
                }
                
                if (selectedDate) {
                    filtered = filtered.filter(game => game.date === selectedDate);
                }
                
                if (selectedPlayerCount) {
                    filtered = filtered.filter(game => game.players === parseInt(selectedPlayerCount));
                }
                
                if (hasFee !== null) {
                    filtered = filtered.filter(game => game.has_fee === hasFee);
                }
                
                setFilteredGames(filtered);
            }
        } catch (err) {
            console.error('Error refreshing games:', err);
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
                                        {filteredGames.map((game) => {
                                            const userIsRegistered = isUserRegistered(game);
                                            
                                            // Log detailed game info for debugging
                                            console.log(`Game ${game.id} detailed info:`, {
                                                name: game.name,
                                                hasFee: game.has_fee, 
                                                fee: game.fee,
                                                isUserRegistered: userIsRegistered,
                                                joined_players: game.joined_players
                                            });
                                            
                                            return (
                                                <Grid item xs={12} sm={6} md={4} key={game.id}>
                                                    <CustomGameCard 
                                                        game={game}
                                                        userIsRegistered={userIsRegistered}
                                                        currentUser={user}
                                                        onRegister={() => {
                                                            if (!userIsRegistered) {
                                                                handleBookGame(game);
                                                            } else {
                                                                alert('You are already registered for this game');
                                                            }
                                                        }}
                                                    />
                                                </Grid>
                                            );
                                        })}
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