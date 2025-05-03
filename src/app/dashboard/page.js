'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css'; // Merge your CSS from both dashboards here!
import Navbar from '@/components/Navbar';
import PaymentModal from '@/components/PaymentModal';
import { ContentCopy, Check, Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
    Grid, Box, Typography, Chip, Button,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, FormControl, FormControlLabel, FormHelperText,
    Checkbox, Select, MenuItem, InputLabel, IconButton,
    Divider, Alert, Skeleton
} from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import { MaterialReactTable } from 'material-react-table';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Dashboard() {
    // --- User and Games State ---
    const [user, setUser] = useState(null);
    const [games, setGames] = useState([]);
    const [registeredGames, setRegisteredGames] = useState([]);
    const [availableGames, setAvailableGames] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // --- Player Filters ---
    const [dateFilter, setDateFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [feeFilter, setFeeFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);

    // --- Manager Modals & Form State ---
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [currentGame, setCurrentGame] = useState(null);
    const [gameDate, setGameDate] = useState('2025-05-25');
    const [gameTime, setGameTime] = useState('10:00');
    const [playerCount, setPlayerCount] = useState('10');
    const [gameLocation, setGameLocation] = useState('Mission Field, SF');
    const [isPublic, setIsPublic] = useState(true);
    const [hasFee, setHasFee] = useState(false);
    const [gameFee, setGameFee] = useState('');
    const [formError, setFormError] = useState('');
    const [gameSport, setGameSport] = useState('soccer');
    const [commandCopied, setCommandCopied] = useState(false);
    const [gameNotes, setGameNotes] = useState('');

    // --- Payment Modal State ---
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const router = useRouter();

    // Add this function at the top level of your component
    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    // --- Load User and Games ---
    useEffect(() => {
        // Keep existing localStorage auth
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }

        // Get user info and ensure UUID format
        let userData = JSON.parse(localStorage.getItem('user'));
        console.log('Original userData:', userData);

        // If the user ID is not in UUID format, generate one and update localStorage
        if (userData && userData.id === 'player') {
            userData = {
                ...userData,
                id: generateUUID()  // Generate a proper UUID
            };
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('Updated userData with UUID:', userData);
        }

        setUser(userData);
        loadGamesFromSupabase();
    }, [router]);


    // --- Player: Register for Game ---
    const handleRegisterGame = (game) => {
        console.log("handleRegisterGame called with game:", JSON.stringify(game, null, 2));

        if (!game) {
            console.error("No game provided to handleRegisterGame");
            return;
        }

        if (game.has_fee) {
            // Store the game in the component state
            setCurrentGame({ ...game });
            console.log("Setting currentGame for payment:", JSON.stringify(game, null, 2));
            setShowPaymentModal(true);
        } else {
            registerPlayerForGame(game);
        }
    };

    const testSupabaseConnection = async () => {
        try {
            const { data, error } = await supabase.from('games').select('*').limit(5);

            if (error) {
                console.error('Error fetching profiles:', error);
                alert('Error connecting to Supabase: ' + error.message);
                return;
            }

            console.log('Successfully connected to Supabase!');
            console.log('Sample data:', data);
            alert('Successfully connected to Supabase! Check console for sample data.');
        } catch (err) {
            console.error('Error:', err);
            alert('Error: ' + err.message);
        }
    };


    const testSupabaseConnectionUsers = async () => {
        try {
            const { data, error } = await supabase.from('users').select('*').limit(5);

            if (error) {
                console.error('Error fetching profiles:', error);
                alert('Error connecting to Supabase: ' + error.message);
                return;
            }

            console.log('Successfully connected to Supabase!');
            console.log('Sample data:', data);
            alert('Successfully connected to Supabase! Check console for sample data.');
        } catch (err) {
            console.error('Error:', err);
            alert('Error: ' + err.message);
        }
    };




    const registerPlayerForGame = async (gameParam) => {
        try {
            console.log("====== REGISTER PLAYER FOR GAME ======");
            console.log("Game parameter received:", JSON.stringify(gameParam, null, 2));

            // Safety check - if gameParam is undefined or null, try to use currentGame
            const game = gameParam || currentGame;

            if (!game) {
                console.error("No game available for registration");
                return;
            }

            if (!game.id) {
                console.error("Game has no ID:", JSON.stringify(game, null, 2));
                return;
            }

            console.log("Using game ID for lookup:", game.id);

            // Always get the latest version of the game from Supabase
            const { data: currentGameData, error: fetchError } = await supabase
                .from('games')
                .select('*')
                .eq('id', game.id)
                .single();

            if (fetchError) {
                console.error('Error fetching game:', fetchError);
                return;
            }

            console.log("Game data from Supabase:", JSON.stringify(currentGameData, null, 2));

            if (!currentGameData) {
                console.error("Game not found in database");
                return;
            }

            // Create player object to add to joined_players
            const playerToAdd = {
                id: user.id,
                name: user.name,
                joinedDate: new Date().toLocaleDateString(),
                // Set hasPaid to true when coming from payment completion flow
                hasPaid: currentGameData.has_fee ? gameParam !== null : true,
                skill: user.skill || 'Intermediate'
            };

            console.log("Player to add:", JSON.stringify(playerToAdd, null, 2));

            // Get current joined_players array
            const joinedPlayers = Array.isArray(currentGameData.joined_players)
                ? currentGameData.joined_players
                : [];

            // Check if user is already registered
            if (joinedPlayers.some(player => player.id === user.id)) {
                console.log('User already registered for this game');
                return;
            }

            // Add the new player
            const updatedJoinedPlayers = [...joinedPlayers, playerToAdd];

            console.log("Updated joined_players:", JSON.stringify(updatedJoinedPlayers, null, 2));

            // Update the game in Supabase
            const { error: updateError } = await supabase
                .from('games')
                .update({ joined_players: updatedJoinedPlayers })
                .eq('id', currentGameData.id);

            if (updateError) {
                console.error('Error registering for game:', updateError);
                return;
            }

            console.log('Successfully registered for game!');

            // Reload all games from Supabase to refresh the UI
            await loadGamesFromSupabase();

        } catch (err) {
            console.error('Error registering for game:', err);
        }
    };

    // Fix handlePaymentComplete to properly handle the game object
    const handlePaymentComplete = async (game) => {
        console.log("====== PAYMENT COMPLETE ======");
        console.log("Payment complete for game:", JSON.stringify(game, null, 2));

        // If game is undefined, use the currentGame from state
        const gameToRegister = game || currentGame;

        console.log("Game to register (after fallback):", JSON.stringify(gameToRegister, null, 2));

        if (!gameToRegister) {
            console.error("No game available for registration!");
            setShowPaymentModal(false);
            return;
        }

        try {
            await registerPlayerForGame(gameToRegister);
            console.log("Registration completed after payment");
            setShowPaymentModal(false);
            setCurrentGame(null);
        } catch (err) {
            console.error("Error in payment completion:", err);
            setShowPaymentModal(false);
        }
    };

    // --- Manager: Create/Edit Game ---
    const handleCreateGame = async (e) => {
        e.preventDefault();
        if (!gameDate || !gameTime || !playerCount || !gameLocation || !gameSport) {
            setFormError('All fields are required');
            return;
        }
        if (hasFee && (!gameFee || isNaN(parseFloat(gameFee)) || parseFloat(gameFee) <= 0)) {
            setFormError('Please enter a valid fee amount');
            return;
        }

        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('User data from localStorage:', userData);

        if (!userData?.id) {
            setFormError('User not found. Please log in again.');
            return;
        }

        const newGame = {
            id: generateUUID(),
            name: `${gameSport.charAt(0).toUpperCase() + gameSport.slice(1)} Game at ${gameLocation}`,
            date: gameDate,
            time: gameTime,
            players: parseInt(playerCount, 10),
            status: 'Upcoming',
            location: gameLocation,
            is_public: isPublic,
            has_fee: hasFee,
            fee: hasFee ? parseFloat(gameFee) : 0,
            joined_players: [], // This will be converted to JSONB by Supabase
            sport: gameSport,
            notes: gameNotes,
            created_by: userData.email
        };

        // Remove any undefined or null values
        Object.keys(newGame).forEach(key =>
            (newGame[key] === undefined || newGame[key] === null) && delete newGame[key]
        );

        try {
            const { data, error } = await supabase
                .from('games')
                .insert([newGame])
                .select();

            if (error) {
                console.error('Supabase error:', error);
                setFormError('Failed to create game. Please try again.');
                return;
            }

            console.log('Successfully created game:', data);
            await loadGamesFromSupabase();

            setShowCreateModal(false);
            resetForm();
        } catch (err) {
            console.error('Error:', err);
            setFormError('An unexpected error occurred. Please try again.');
        }
    };

    const handleEditGame = async (e) => {
        e.preventDefault();
        if (!gameDate || !gameTime || !playerCount || !gameLocation || !gameSport) {
            setFormError('All fields are required');
            return;
        }
        if (hasFee && (!gameFee || isNaN(parseFloat(gameFee)) || parseFloat(gameFee) <= 0)) {
            setFormError('Please enter a valid fee amount');
            return;
        }

        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('User data from localStorage:', userData);

        if (!userData?.id) {
            setFormError('User not found. Please log in again.');
            return;
        }

        const updatedGame = {
            name: `${gameSport.charAt(0).toUpperCase() + gameSport.slice(1)} Game at ${gameLocation}`,
            date: gameDate,
            time: gameTime,
            players: parseInt(playerCount, 10),
            status: 'Upcoming',
            location: gameLocation,
            is_public: isPublic,
            has_fee: hasFee,
            fee: hasFee ? parseFloat(gameFee) : 0,
            joined_players: currentGame.joined_players || [], // Preserve existing joined players
            sport: gameSport,
            notes: gameNotes,
            created_by: userData.email // Match the same property as create
        };

        // Remove any undefined or null values
        Object.keys(updatedGame).forEach(key =>
            (updatedGame[key] === undefined || updatedGame[key] === null) && delete updatedGame[key]
        );

        try {
            const { error } = await supabase
                .from('games')
                .update(updatedGame)
                .eq('id', currentGame.id);

            if (error) {
                console.error('Error updating game:', error);
                setFormError('Failed to update game. Please try again.');
                return;
            }

            // Refresh games list
            await loadGamesFromSupabase();

            setShowEditModal(false);
            resetForm();
        } catch (err) {
            console.error('Error:', err);
            setFormError('An unexpected error occurred. Please try again.');
        }
    };

    const openEditModal = (game) => {
        setCurrentGame(game);
        setGameDate(game.date);
        setGameTime(game.time || '');
        setPlayerCount(game.players.toString());
        setGameLocation(game.location);
        setIsPublic(game.is_public);
        setHasFee(game.has_fee);
        setGameFee(game.fee ? game.fee.toString() : '');
        setGameSport(game.sport || 'soccer');
        setGameNotes(game.notes || '');
        setShowEditModal(true);
    };

    const openViewModal = (game) => {
        setCurrentGame(game);
        setShowViewModal(true);
    };

    const resetForm = () => {
        setGameDate('2025-05-25');
        setGameTime('10:00');
        setPlayerCount('10');
        setGameLocation('Mission Field, SF');
        setIsPublic(true);
        setHasFee(false);
        setGameFee('');
        setFormError('');
        setGameSport('soccer');
        setGameNotes('');
        setCurrentGame(null);
    };

    // --- Remove Player from Game ---
    const handleRemovePlayer = (gameId, playerId) => {
        const updatedGames = games.map(game => {
            if (game.id === gameId && game.joinedPlayers) {
                return {
                    ...game,
                    joinedPlayers: game.joinedPlayers.filter(player => player.id !== playerId)
                };
            }
            return game;
        });
        setGames(updatedGames);
        if (currentGame && currentGame.id === gameId) {
            setCurrentGame({
                ...currentGame,
                joinedPlayers: currentGame.joinedPlayers.filter(player => player.id !== playerId)
            });
        }
    };

    // --- Player Filters ---
    const filteredAvailableGames = availableGames.filter(game => {
        const matchesDate = !dateFilter ? true : game.date === dateFilter;
        const matchesLocation = !locationFilter ? true : game.location.toLowerCase() === locationFilter.toLowerCase();
        const matchesFee = feeFilter === 'all' ? true :
            (feeFilter === 'free' && !game.has_fee) ||
            (feeFilter === 'paid' && game.has_fee);
        return matchesDate && matchesLocation && matchesFee;
    });

    // --- Stats ---
    const totalGames = games.length;
    const activeGames = games.filter(game => game.status === 'Upcoming').length;
    const totalPlayers = games.reduce((acc, game) => acc + (game.joinedPlayers?.length || 0), 0);
    const totalPayments = games.reduce((acc, game) => {
        if (!game.joinedPlayers) return acc;
        const paidPlayers = game.joinedPlayers.filter(player => player.hasPaid).length;
        return acc + (paidPlayers * (game.has_fee ? game.fee : 0));
    }, 0);
    const totalRevenue = games.reduce((acc, game) => {
        if (!game.joinedPlayers) return acc;
        return acc + ((game.joinedPlayers.length || 0) * (game.has_fee ? game.fee : 0));
    }, 0);

    // Add this function from manager-dashboard
    const handleOpenCreateModal = () => {
        setGameDate('2025-05-25');
        setGameTime('10:00 AM');
        setPlayerCount('10');
        setGameLocation('Mission Field, SF');
        setIsPublic(true);
        setHasFee(false);
        setGameFee('');
        setFormError('');
        setGameNotes('');
        setGameSport('soccer');

        setShowCreateModal(true);
    };

    const copyCommandToClipboard = () => {
        const command = `!!creategame ${gameDate || 'YYYY-MM-DD'} ${gameTime || 'HH:MM AM/PM'} ${playerCount || '#'} ${gameLocation || 'Location'} ${hasFee ? `$${gameFee || '0.00'}` : 'free'} ${isPublic ? 'public' : 'private'}`;

        navigator.clipboard.writeText(command)
            .then(() => {
                setCommandCopied(true);
                // Reset copied state after 2 seconds
                setTimeout(() => setCommandCopied(false), 2000);
            })
            .catch(err => {
                console.error('Failed to copy command: ', err);
            });
    };

    // Add this function near the top with other functions
    const loadGamesFromSupabase = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('games')
                .select('*')
            // .order('created_at', { ascending: false });

            if (error) {
                console.error('Error loading games:', error);
                return;
            }

            if (data) {
                setGames(data);
                // Update other game states using localStorage user
                const userData = JSON.parse(localStorage.getItem('user'));
                if (userData) {
                    const userRegisteredGames = data.filter(game =>
                        game.joined_players && game.joined_players.some(player => player.id === userData.id)
                    );
                    console.log("registeredGames before setState:", JSON.stringify(userRegisteredGames, null, 2));
                    setRegisteredGames(userRegisteredGames);

                    const userAvailableGames = data.filter(game => {
                        const isRegistered = game.joined_players && game.joined_players.some(player => player.id === userData.id);
                        const notCompleted = game.status !== 'Completed';
                        return !isRegistered && notCompleted;
                    });
                    setAvailableGames(userAvailableGames);

                    // Update filters
                    setAvailableLocations([...new Set(data.map(game => game.location))]);
                    const dates = [...new Set(data.map(game => game.date))];
                    dates.sort((a, b) => new Date(a) - new Date(b));
                    setAvailableDates(dates);
                }
            }
            setIsLoading(false);
        } catch (err) {
            console.error('Error:', err);
            setIsLoading(false);
        }
    };

    // Inside your Dashboard component, add this function before the return statement
    const columns = [
        {
            accessorKey: 'name',
            header: 'Game Name',
        },
        {
            accessorFn: (row) => `${row.date} ${row.time ? `at ${row.time}` : ''}`,
            header: 'Date & Time',
        },
        {
            accessorFn: (row) => `${row.joined_players?.length || 0} / ${row.players}`,
            header: 'Players',
        },
        {
            accessorKey: 'location',
            header: 'Location',
        },
        {
            accessorKey: 'sport',
            header: 'Sport',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            Cell: ({ cell }) => (
                <span className={`${styles.statusBadge} ${styles[cell.getValue().toLowerCase().replace(/\s/g, '')]}`}>
                    {cell.getValue()}
                </span>
            ),
        },
        {
            accessorFn: (row) => row.has_fee ? `$${row.fee.toFixed(2)}` : 'Free',
            header: 'Fee',
        },
        {
            accessorKey: 'is_public',
            header: 'Visibility',
            Cell: ({ cell }) => (
                <span className={`${styles.visibilityBadge} ${cell.getValue() ? styles.public : styles.private}`}>
                    {cell.getValue() ? 'Public' : 'Private'}
                </span>
            ),
        },
    ];

    if (!user) return (
        <>
            <Navbar />
            <div className={styles.dashboardContainer}>
                <div className={styles.dashboard}>
                    <div className={styles.welcomeSection}>
                        <Skeleton variant="text" width="60%" height={60} />
                        <Skeleton variant="text" width="40%" height={30} />
                    </div>
                    
                    {/* Stats section skeleton */}
                    <div className={styles.dashboardSection}>
                        <Skeleton variant="text" width="30%" height={40} />
                        <div className={styles.statsGrid}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={styles.statCard}>
                                    <Skeleton variant="text" width="80%" height={40} />
                                    <Skeleton variant="text" width="60%" height={30} />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Registered games skeleton */}
                    <div className={styles.dashboardSection}>
                        <Skeleton variant="text" width="40%" height={40} />
                        <div className={styles.gamesList}>
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={styles.gameCard}>
                                    <Skeleton variant="rounded" width="100%" height={120} />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Available games skeleton */}
                    <div className={styles.dashboardSection}>
                        <Skeleton variant="text" width="40%" height={40} />
                        <div className={styles.availableGamesList}>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className={styles.availableGameCard}>
                                    <Skeleton variant="rounded" width="100%" height={180} />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Games management skeleton */}
                    <div className={styles.dashboardSection}>
                        <Skeleton variant="text" width="40%" height={40} />
                        <Skeleton variant="rounded" width="200px" height={50} sx={{ mb: 2 }} />
                        <Skeleton variant="rounded" width="100%" height={400} />
                    </div>
                </div>
            </div>
        </>
    );

    // console.log('games',games)
    return (
        <>
            <Navbar />
            <div className={styles.dashboardContainer}>
                <div className={styles.dashboard}>
                    <div className={styles.welcomeSection}>
                        <h1>Welcome, {user?.name || 'User'}!</h1>
                        <p>User ID: {user?.id || 'user123'}</p>
                    </div>

                    {/* --- Quick Stats --- */}
                    <div className={styles.dashboardSection}>
                        <h3>Quick Stats</h3>
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{totalGames}</div>
                                <div className={styles.statLabel}>Total Games</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{activeGames}</div>
                                <div className={styles.statLabel}>Active Games</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{totalPlayers}</div>
                                <div className={styles.statLabel}>Total Players</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>{totalPayments}</div>
                                <div className={styles.statLabel}>Payments Received</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statValue}>${totalRevenue.toFixed(2)}</div>
                                <div className={styles.statLabel}>Revenue</div>
                            </div>
                        </div>
                    </div>

                    {/* --- Registered Games (Player) --- */}
                    <div className={styles.dashboardSection}>
                        <h3>Your Registered Games</h3>
                        <div className={styles.gamesList}>
                            {isLoading ? (
                                // Skeleton loaders for registered games
                                [...Array(3)].map((_, i) => (
                                    <div key={i} className={styles.gameCard}>
                                        <Skeleton variant="rounded" width="100%" height={120} />
                                    </div>
                                ))
                            ) : registeredGames.length > 0 ? (
                                registeredGames.map(game => (
                                    <div key={game.id} className={styles.gameCard}>
                                        <div className={styles.gameDetails}>
                                            <div className={styles.gameName}>{game.name}</div>
                                            <div className={styles.gameDate}>{game.date} {game.time && `at ${game.time}`}</div>
                                            <div className={styles.gameLocation}>
                                                <span className={styles.locationIcon}>📍</span> {game.location}
                                            </div>
                                        </div>
                                        <div className={styles.gameStatusSection}>
                                            <div className={styles.feeAmount}>{game.has_fee ? `$${game.fee.toFixed(2)}` : 'Free'}</div>
                                            <div className={`${styles.gameStatus} ${styles.registered}`}>Registered</div>
                                            {(() => {
                                                console.log(`Game ${game.name} payment check:`, JSON.stringify({
                                                    gameId: game.id,
                                                    hasJoinedPlayers: !!game.joined_players,
                                                    hasJoinedPlayersArray: Array.isArray(game.joined_players),
                                                    joinedPlayersLength: game.joined_players?.length,
                                                    userId: user.id,
                                                    foundPlayer: game.joined_players?.find(player => player.id === user.id),
                                                    hasPaid: game.joined_players?.find(player => player.id === user.id)?.hasPaid
                                                }, null, 2));

                                                // Use joined_players (with underscore) instead of joinedPlayers
                                                const currentPlayer = game.joined_players?.find(player => player.id === user.id);

                                                if (currentPlayer?.hasPaid) {
                                                    return (
                                                        <div className={styles.paymentStatus}>
                                                            <span className={styles.paidIcon}>✓</span> Paid
                                                        </div>
                                                    );
                                                } else if (game.has_fee) {
                                                    return (
                                                        <div className={styles.paymentStatus}>
                                                            <span className={styles.unpaidIcon}>!</span> Unpaid
                                                        </div>
                                                    );
                                                } else {
                                                    return null;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>You haven't registered for any games yet.</p>
                            )}
                        </div>
                    </div>

                    {/* --- Available Games (Player) --- */}
                    <div className={styles.dashboardSection}>
                        <div className={styles.sectionHeader}>
                            <h3>Available Games</h3>
                            <button
                                className={styles.filterButton}
                                onClick={() => setShowFilters(!showFilters)}
                                aria-label={showFilters ? "Hide filters" : "Show filters"}
                            >
                                <span className={styles.filterIcon}>🔍</span>
                                <span>{showFilters ? "Hide Filters" : "Filters"}</span>
                            </button>
                        </div>
                        {showFilters && (
                            <div className={styles.filtersPanel}>
                                <div className={styles.filterGroup}>
                                    <label htmlFor="dateFilter">Date:</label>
                                    <select
                                        id="dateFilter"
                                        className={styles.filterSelect}
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value)}
                                    >
                                        <option value="">All Dates</option>
                                        {availableDates.map(date => (
                                            <option key={date} value={date}>{date}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.filterGroup}>
                                    <label htmlFor="locationFilter">Location:</label>
                                    <select
                                        id="locationFilter"
                                        className={styles.filterSelect}
                                        value={locationFilter}
                                        onChange={(e) => setLocationFilter(e.target.value)}
                                    >
                                        <option value="">All Locations</option>
                                        {availableLocations.map(location => (
                                            <option key={location} value={location}>{location}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.filterGroup}>
                                    <label htmlFor="feeFilter">Fee:</label>
                                    <select
                                        id="feeFilter"
                                        className={styles.filterSelect}
                                        value={feeFilter}
                                        onChange={(e) => setFeeFilter(e.target.value)}
                                    >
                                        <option value="all">All Games</option>
                                        <option value="free">Free Games</option>
                                        <option value="paid">Paid Games</option>
                                    </select>
                                </div>
                                <button
                                    className={styles.resetFiltersButton}
                                    onClick={() => {
                                        setDateFilter('');
                                        setLocationFilter('');
                                        setFeeFilter('all');
                                    }}
                                >
                                    Reset Filters
                                </button>
                            </div>
                        )}
                        <div className={styles.resultsInfo}>
                            <p>
                                {filteredAvailableGames.length === 0
                                    ? 'No games available at the moment.'
                                    : `Showing ${filteredAvailableGames.length} game${filteredAvailableGames.length !== 1 ? 's' : ''}.`}
                            </p>
                        </div>
                        <div className={styles.availableGamesList}>
                            {isLoading ? (
                                // Skeleton loaders for available games
                                [...Array(4)].map((_, i) => (
                                    <div key={i} className={styles.availableGameCard}>
                                        <Skeleton variant="rounded" width="100%" height={180} />
                                    </div>
                                ))
                            ) : filteredAvailableGames.length > 0 ? (
                                filteredAvailableGames
                                    .filter(game => game.is_public)
                                    .map(game => (
                                        <div key={game.id} className={styles.availableGameCard}>
                                            <div className={styles.gameDetails}>
                                                <div style={{ marginTop: 8 }} className={styles.gameName}>{game.name}</div>
                                                <div style={{ marginTop: 8 }} className={styles.gameDate}>{game.date} {game.time && `at ${game.time}`}</div>
                                                <div style={{ marginTop: 8 }} className={styles.gameLocation}>
                                                    <span className={styles.locationIcon}>📍</span> {game.location}
                                                </div>
                                                <div style={{ marginTop: 8 }} className={styles.playerCount}>
                                                    <span className={styles.playerCountIcon}>👥</span>
                                                    {game.joinedPlayers ? game.joinedPlayers.length : 0}/{game.players} players
                                                </div>

                                                <div style={{ marginTop: 8 }} className={styles.gameFee}>
                                                    <span className={styles.feeIcon}>💰</span> ${game.has_fee ? game.fee.toFixed(2) : 'Free'}
                                                </div>

                                            </div>
                                            <div style={{ marginTop: 8 }} className={styles.gameActions}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleRegisterGame(game)}
                                                    className={styles.registerButton}
                                                >
                                                    Register
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className={styles.noGamesMessage}>
                                    <p>No available games at the moment. Check back later!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- Games Management (Manager) --- */}
                    <div className={styles.dashboardSection}>
                        <h3>Games Management</h3>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={handleOpenCreateModal}
                            className={styles.muiCreateButton}
                        >
                            Create New Game
                        </Button>

                        {isLoading ? (
                            <Box sx={{ mt: 2 }}>
                                <Skeleton variant="rounded" width="100%" height={400} />
                            </Box>
                        ) : games.length > 0 ? (
                            <Box sx={{ mt: 2 }}>
                                <MaterialReactTable
                                    columns={columns}
                                    data={games}
                                    enableColumnFiltering
                                    enableSorting
                                    enableRowActions
                                    renderRowActions={({ row }) => (
                                        <Box sx={{ display: 'flex', gap: '8px' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => openEditModal(row.original)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => openViewModal(row.original)}
                                            >
                                                View
                                            </Button>
                                        </Box>
                                    )}
                                    muiTableProps={{
                                        sx: {
                                            tableLayout: 'fixed',
                                        },
                                    }}
                                    initialState={{
                                        density: 'compact',
                                        pagination: { pageSize: 10, pageIndex: 0 },
                                        sorting: [{ id: 'date', desc: false }],
                                    }}
                                    muiTableHeadCellProps={{
                                        sx: {
                                            fontWeight: 'bold',
                                            backgroundColor: '#f5f5f5',
                                        },
                                    }}
                                    muiTableBodyRowProps={{
                                        sx: {
                                            '&:nth-of-type(odd)': {
                                                backgroundColor: '#fafafa',
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        ) : (
                            <div className={styles.noGamesMessage}>
                                <p>No games available. Create your first game to get started!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- Payment Modal --- */}
                {showPaymentModal && currentGame && (
                    <PaymentModal
                        open={showPaymentModal}
                        onClose={() => setShowPaymentModal(false)}
                        game={currentGame}
                        onPaymentComplete={handlePaymentComplete}
                        user={user}
                    />
                )}

                {/* --- Create/Edit/View Modals --- */}
                {/* Create Game Dialog */}
                <Dialog
                    open={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false);
                        resetForm();
                    }}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Create New Game</Typography>
                        <IconButton
                            onClick={() => {
                                setShowCreateModal(false);
                                resetForm();
                            }}
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent dividers>
                        <Box component="form" onSubmit={handleCreateGame} sx={{ pt: 1 }}>
                            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        id="gameDate"
                                        label="Date"
                                        type="date"
                                        value={gameDate}
                                        onChange={(e) => setGameDate(e.target.value)}
                                        fullWidth
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        id="gameTime"
                                        label="Game Time"
                                        type="time"
                                        value={gameTime}
                                        onChange={(e) => setGameTime(e.target.value)}
                                        fullWidth
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        id="playerCount"
                                        label="Number of Players/Teams"
                                        type="number"
                                        InputProps={{ inputProps: { min: 2 } }}
                                        value={playerCount}
                                        onChange={(e) => setPlayerCount(e.target.value)}
                                        fullWidth
                                        margin="normal"
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        id="gameLocation"
                                        label="Location"
                                        type="text"
                                        value={gameLocation}
                                        onChange={(e) => setGameLocation(e.target.value)}
                                        placeholder="e.g. Mission Field, SF"
                                        fullWidth
                                        margin="normal"
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="gameSportLabel">Sport</InputLabel>
                                        <Select
                                            labelId="gameSportLabel"
                                            id="gameSport"
                                            value={gameSport}
                                            onChange={(e) => setGameSport(e.target.value)}
                                            label="Sport"
                                        >
                                            <MenuItem value="soccer">Soccer</MenuItem>
                                            <MenuItem value="basketball">Basketball</MenuItem>
                                            <MenuItem value="football">Football</MenuItem>
                                            <MenuItem value="volleyball">Volleyball</MenuItem>
                                            <MenuItem value="tennis">Tennis</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                id="isPublic"
                                                checked={isPublic}
                                                onChange={(e) => setIsPublic(e.target.checked)}
                                            />
                                        }
                                        label="Make this game public"
                                    />
                                    <FormHelperText>Public games are visible to all players for registration</FormHelperText>
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                id="hasFee"
                                                checked={hasFee}
                                                onChange={(e) => setHasFee(e.target.checked)}
                                            />
                                        }
                                        label="Charge a fee for this game"
                                    />

                                    {hasFee && (
                                        <Box sx={{ ml: 4, mt: 1 }}>
                                            <TextField
                                                id="gameFee"
                                                label="Fee Amount ($)"
                                                type="number"
                                                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                                value={gameFee}
                                                onChange={(e) => setGameFee(e.target.value)}
                                                placeholder="0.00"
                                                size="small"
                                                required={hasFee}
                                            />
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3, p: 2, borderRadius: 1 }}>
                                <TextField
                                    id="gameNotes"
                                    label="Notes"
                                    multiline
                                    rows={4}
                                    value={gameNotes}
                                    onChange={(e) => setGameNotes(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    placeholder="Add any additional notes about the game here..."
                                    variant="outlined"
                                />
                            </Box>

                            <Box sx={{ mt: 3, p: 2, borderRadius: 1 }}>
                                <Typography variant="body2">This is equivalent to the WhatsApp command:</Typography>
                                <Box
                                    onClick={copyCommandToClipboard}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        p: 1.5,
                                        borderRadius: 1,
                                        cursor: 'pointer',
                                        mt: 1,
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
                                        !!creategame {gameDate || 'YYYY-MM-DD'} {gameTime || 'HH:MM AM/PM'} {playerCount || '#'} {gameLocation || 'Location'} {hasFee ? `$${gameFee || '0.00'}` : 'free'} {isPublic ? 'public' : 'private'}
                                    </Typography>
                                    <IconButton size="small" color={commandCopied ? "success" : "default"}>
                                        {commandCopied ? <Check /> : <ContentCopy />}
                                    </IconButton>
                                </Box>
                                {commandCopied && (
                                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                                        Command copied to clipboard!
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button
                            onClick={() => {
                                setShowCreateModal(false);
                                resetForm();
                            }}
                            variant="outlined"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateGame}
                            variant="contained"
                            color="primary"
                        >
                            Create Game
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Game Dialog */}
                <Dialog
                    open={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        resetForm();
                    }}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Edit Game</Typography>
                        <IconButton
                            onClick={() => {
                                setShowEditModal(false);
                                resetForm();
                            }}
                            size="small"
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent dividers>
                        <Box component="form" onSubmit={handleEditGame} sx={{ pt: 1 }}>
                            {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        id="editGameDate"
                                        label="Date"
                                        type="date"
                                        value={gameDate}
                                        onChange={(e) => setGameDate(e.target.value)}
                                        fullWidth
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        id="editGameTime"
                                        label="Time"
                                        type="time"
                                        value={gameTime}
                                        onChange={(e) => setGameTime(e.target.value)}
                                        fullWidth
                                        margin="normal"
                                        InputLabelProps={{ shrink: true }}
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        id="editPlayerCount"
                                        label="Number of Players/Teams"
                                        type="number"
                                        InputProps={{ inputProps: { min: 2 } }}
                                        value={playerCount}
                                        onChange={(e) => setPlayerCount(e.target.value)}
                                        fullWidth
                                        margin="normal"
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        id="editGameLocation"
                                        label="Location"
                                        type="text"
                                        value={gameLocation}
                                        onChange={(e) => setGameLocation(e.target.value)}
                                        fullWidth
                                        margin="normal"
                                        required
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControl fullWidth margin="normal">
                                        <InputLabel id="editGameSportLabel">Sport</InputLabel>
                                        <Select
                                            labelId="editGameSportLabel"
                                            id="editGameSport"
                                            value={gameSport}
                                            onChange={(e) => setGameSport(e.target.value)}
                                            label="Sport"
                                        >
                                            <MenuItem value="soccer">Soccer</MenuItem>
                                            <MenuItem value="basketball">Basketball</MenuItem>
                                            <MenuItem value="football">Football</MenuItem>
                                            <MenuItem value="volleyball">Volleyball</MenuItem>
                                            <MenuItem value="tennis">Tennis</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                id="editIsPublic"
                                                checked={isPublic}
                                                onChange={(e) => setIsPublic(e.target.checked)}
                                            />
                                        }
                                        label="Make this game public"
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                id="editHasFee"
                                                checked={hasFee}
                                                onChange={(e) => setHasFee(e.target.checked)}
                                            />
                                        }
                                        label="Charge a fee for this game"
                                    />

                                    {hasFee && (
                                        <Box sx={{ ml: 4, mt: 1 }}>
                                            <TextField
                                                id="editGameFee"
                                                label="Fee Amount ($)"
                                                type="number"
                                                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                                value={gameFee}
                                                onChange={(e) => setGameFee(e.target.value)}
                                                placeholder="0.00"
                                                size="small"
                                                required={hasFee}
                                            />
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3, p: 2, borderRadius: 1 }}>
                                <TextField
                                    id="editGameNotes"
                                    label="Notes"
                                    multiline
                                    rows={4}
                                    value={gameNotes}
                                    onChange={(e) => setGameNotes(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    placeholder="Add any additional notes about the game here..."
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button
                            onClick={() => {
                                setShowEditModal(false);
                                resetForm();
                            }}
                            variant="outlined"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleEditGame}
                            variant="contained"
                            color="primary"
                        >
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
} 