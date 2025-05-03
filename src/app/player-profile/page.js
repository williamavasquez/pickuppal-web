'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  EmojiEvents as TrophyIcon,
  Timeline as StatsIcon,
  Settings as SettingsIcon,
  SportsSoccer, SportsBasketball, SportsTennis, 
  SportsVolleyball, SportsBaseball, SportsGolf, 
  Sports as GenericSportIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { deepOrange, deepPurple, blue, green } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Custom styled components
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ProfileHeader = styled(Paper)(({ theme }) => ({
  position: 'relative',
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  padding: theme.spacing(4, 3),
  color: theme.palette.text.primary,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[2],
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// Enhanced sport card styling for a more premium look
const SportCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  borderRadius: 12,
  transition: 'all 0.2s ease-in-out',
  border: '1px solid',
  borderColor: 'rgba(0, 0, 0, 0.08)',
  overflow: 'visible',
  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: 'rgba(17, 12, 46, 0.15) 0px 48px 100px 0px',
  },
}));

const SportIconWrapper = styled(Box)(({ theme, sportColor }) => ({
  position: 'absolute',
  top: -20,
  right: 24,
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: sportColor || theme.palette.primary.main,
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
  border: `3px solid ${theme.palette.background.paper}`,
  zIndex: 1,
}));

const SportGradientHeader = styled(Box)(({ theme, sportColor }) => ({
  height: 80,
  background: `linear-gradient(135deg, ${sportColor || theme.palette.primary.main} 0%, ${sportColor ? sportColor + '99' : theme.palette.primary.light} 100%)`,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  position: 'relative',
}));

// Redesigned add sport button with pulse animation
const AddSportButton = styled(Button)(({ theme }) => ({
  position: 'relative',
  borderRadius: 16,
  padding: theme.spacing(2, 3),
  minHeight: 56,
  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  color: '#fff',
  fontWeight: 600,
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  boxShadow: '0 4px 20px 0 rgba(61, 71, 82, 0.1), 0 0 0 0 rgba(0, 127, 255, 0)',
  '&:hover': {
    boxShadow: '0 8px 16px rgba(61, 71, 82, 0.2)',
    transform: 'translateY(-2px)',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    borderRadius: 16,
    animation: 'pulse 2s infinite',
    background: 'rgba(255, 255, 255, 0.1)',
    zIndex: -1,
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.05)',
      opacity: 0.5,
    },
    '100%': {
      transform: 'scale(1.1)',
      opacity: 0,
    },
  },
}));

// Enhanced styling for the sport form popup
const SportFormPopup = styled(Paper)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(4),
  borderRadius: 16,
  boxShadow: 'rgba(17, 12, 46, 0.15) 0px 48px 100px 0px',
  animation: 'fadeIn 0.3s ease-out forwards',
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
      transform: 'translateY(10px)',
    },
    '100%': {
      opacity: 1, 
      transform: 'translateY(0)',
    },
  },
  [theme.breakpoints.up('sm')]: {
    minWidth: 450,
  }
}));

const PositionChip = styled(Chip)(({ theme, active }) => ({
  margin: theme.spacing(0.5),
  transition: 'all 0.2s ease',
  fontWeight: 500,
  backgroundColor: active ? theme.palette.primary.main : theme.palette.background.default,
  color: active ? '#fff' : theme.palette.text.primary,
  border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : theme.palette.action.hover,
    transform: 'translateY(-2px)',
  },
}));

// Updated sport color mapping with more vibrant colors
const sportColorMap = {
  'Soccer': '#38b000', // Bright green
  'Basketball': '#fb8500', // Bright orange
  'Tennis': '#00b4d8', // Bright blue
  'Volleyball': '#ffbe0b', // Bright yellow
  'Baseball': '#e63946', // Bright red
  'Golf': '#43aa8b', // Teal
  'Football': '#8d6a9f', // Purple
  'Hockey': '#4361ee', // Royal blue
  'Rugby': '#bc6c25', // Brown
  'Other': '#7209b7', // Purple
};

export default function PlayerProfile() {
  const router = useRouter();
  const theme = useTheme();
  
  // State variables
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  
  // Profile data states
  const [nickname, setNickname] = useState('');
  const [sports, setSports] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState('');
  
  // New state for temporary sport selection in form
  const [currentSport, setCurrentSport] = useState('');
  const [currentPosition, setCurrentPosition] = useState([]);
  
  // Error and success message states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // New states for enhanced sport selection experience
  const [showSportForm, setShowSportForm] = useState(false);

  // New state for position selection via chips for better UX
  const [selectedPositionChip, setSelectedPositionChip] = useState('');

  // Add currentSkillLevel for the form
  const [currentSkillLevel, setCurrentSkillLevel] = useState('Beginner');

  // Available options for dropdowns
  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];
  const sportOptions = [
    'Soccer',
    'Basketball',
    'Tennis',
    'Volleyball',
    'Baseball',
    'Golf',
    'Pickleball',
    'Padel',
    'Ultimate Frisbee',
    'Flag Football',
    'Hockey',
    'Rugby',
    'Cricket',
    'Table Tennis',
    'Badminton',
    'Other'
  ];
  const positions = {
    'Soccer': ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
    'Basketball': ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
    'Tennis': ['Singles Player', 'Doubles Player'],
    'Volleyball': ['Setter', 'Outside Hitter', 'Middle Blocker', 'Libero'],
    'Baseball': ['Pitcher', 'Catcher', 'Infielder', 'Outfielder'],
    'Golf': ['Amateur', 'Professional'],
    'Pickleball': ['Singles', 'Doubles'],
    'Padel': ['Player'],
    'Ultimate Frisbee': ['Handler', 'Cutter'],
    'Flag Football': ['Quarterback', 'Receiver', 'Rusher', 'Defender'],
    'Hockey': ['Goalie', 'Defenseman', 'Winger', 'Center'],
    'Rugby': ['Prop', 'Hooker', 'Lock', 'Flanker', 'Scrum-half', 'Fly-half', 'Center', 'Wing', 'Fullback'],
    'Cricket': ['Batsman', 'Bowler', 'Wicketkeeper', 'All-rounder'],
    'Table Tennis': ['Singles', 'Doubles'],
    'Badminton': ['Singles', 'Doubles', 'Mixed Doubles'],
    'Other': ['Not Specified']
  };

  // Sport icon mapper
  const getSportIcon = (sportName) => {
    switch(sportName) {
      case 'Soccer': return <SportsSoccer />;
      case 'Basketball': return <SportsBasketball />;
      case 'Tennis': return <SportsTennis />;
      case 'Volleyball': return <SportsVolleyball />;
      case 'Baseball': return <SportsBaseball />;
      case 'Golf': return <SportsGolf />;
      // Add custom icons for new sports if available, otherwise use generic
      default: return <GenericSportIcon />;
    }
  };

  // Mock player stats for the stats tab - updated for pickup sports focus
  const playerStats = {
    gamesJoined: 32,
    gamesAttended: 28,
    noShows: 4,
    lastMinuteCancellations: 3,
    reliabilityScore: 87,
    activeStreak: 7,
    recentActivity: 'Very Active', // Options: Very Active, Active, Occasional, Inactive
    totalHoursPlayed: 56,
    joinedDates: [
      '2023-11-05', '2023-11-12', '2023-11-19', '2023-11-26', 
      '2023-12-03', '2023-12-10', '2023-12-17'
    ] // For streak calculation
  };

  useEffect(() => {
    const loadProfileData = async () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }

      // Get user info from localStorage
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);

      try {
        // Load player profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error loading profile:', profileError);
          return;
        }

        if (profileData) {
          setNickname(profileData.nickname || '');
          setBio(profileData.bio || '');
          setProfileImage(profileData.avatar_url || null);
        }

        // Load player sports
        const { data: sportsData, error: sportsError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id);

        if (sportsError) {
          console.error('Error loading sports:', sportsError);
          return;
        }

        if (sportsData) {
          console.log('sportsData',sportsData[0].sports);
          setSports(sportsData[0].sports);
          // setSports(sportsData.map(sport => ({
          //   sport: sport.sport,
          //   positions: sport.positions,
          //   skillLevel: sport.skill_level
          // })));
        }

      } catch (err) {
        console.error('Error:', err);
      }

      setIsLoading(false);
    };

    loadProfileData();
  }, [router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update to handle position as an array in the sport form
  const handleCurrentPositionToggle = (position) => {
    if (currentPosition.includes(position)) {
      // Remove position if already selected
      setCurrentPosition(currentPosition.filter(p => p !== position));
    } else {
      // Add position if not already selected
      setCurrentPosition([...currentPosition, position]);
    }
  };


  const handleAddSport = async () => {
    if (!currentSport) return;
  
    // Check if sport already exists
    if (sports.some(s => s.sport === currentSport)) {
      setSnackbar({
        open: true,
        message: 'This sport is already in your profile',
        severity: 'warning'
      });
      return;
    }
  
    const newSport = {
      sport: currentSport,
      positions: currentPosition,
      skillLevel: currentSkillLevel
    };
  
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const updatedSports = [...sports, newSport];
  
      // Update the sports array in the users table
      const { error } = await supabase
        .from('users')
        .update({ sports: updatedSports })
        .eq('id', userData.id);
  
      if (error) throw error;
  
      setSports(updatedSports);
      setCurrentSport('');
      setCurrentPosition([]);
      setCurrentSkillLevel('Beginner');
      setShowSportForm(false);
  
      setSnackbar({
        open: true,
        message: 'Sport added successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding sport:', error);
      setSnackbar({
        open: true,
        message: 'Error adding sport. Please try again.',
        severity: 'error'
      });
    }
  };
  // Update to handle sport as an array in the sport form
  // const handleAddSport = async () => {
  //   if (!currentSport) return;

  //   // Check if sport already exists
  //   if (sports.some(s => s.sport === currentSport)) {
  //     setSnackbar({
  //       open: true,
  //       message: 'This sport is already in your profile',
  //       severity: 'warning'
  //     });
  //     return;
  //   }

  //   const newSport = {
  //     sport: currentSport,
  //     positions: currentPosition,
  //     skillLevel: currentSkillLevel
  //   };

  //   try {
  //     const userData = JSON.parse(localStorage.getItem('user'));
      
  //     // Add to Supabase
  //     const { error } = await supabase
  //       .from('users')
  //       .insert({
  //         id: userData.id,
  //         sport: currentSport,
  //         positions: currentPosition,
  //         skill_level: currentSkillLevel
  //       });

  //     if (error) throw error;

  //     // Update local state
  //     const updatedSports = [...sports, newSport];
  //     setSports(updatedSports);

  //     // Reset form
  //     setCurrentSport('');
  //     setCurrentPosition([]);
  //     setCurrentSkillLevel('Beginner');
  //     setShowSportForm(false);

  //     setSnackbar({
  //       open: true,
  //       message: 'Sport added successfully!',
  //       severity: 'success'
  //     });
  //   } catch (error) {
  //     console.error('Error adding sport:', error);
  //     setSnackbar({
  //       open: true,
  //       message: 'Error adding sport. Please try again.',
  //       severity: 'error'
  //     });
  //   }
  // };
  
  // Function to remove a sport
  const handleRemoveSport = async (indexToRemove) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const sportToRemove = sports[indexToRemove];

      // Remove from Supabase
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userData.id)
        .eq('sport', sportToRemove.sport);

      if (error) throw error;

      // Update local state
      const updatedSports = sports.filter((_, index) => index !== indexToRemove);
      setSports(updatedSports);

      setSnackbar({
        open: true,
        message: 'Sport removed successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing sport:', error);
      setSnackbar({
        open: true,
        message: 'Error removing sport. Please try again.',
        severity: 'error'
      });
    }
  };
  
  // Function to update a sport's position
  const handleUpdateSportPosition = (index, position) => {
    const updatedSports = [...sports];
    const sportItem = updatedSports[index];
    
    // Initialize positions as array if it doesn't exist
    if (!Array.isArray(sportItem.positions)) {
      // Handle migration from old format that used single position
      sportItem.positions = sportItem.position ? [sportItem.position] : [];
      delete sportItem.position; // Remove old single position property
    }
    
    // Toggle position - add if not present, remove if already selected
    if (sportItem.positions.includes(position)) {
      sportItem.positions = sportItem.positions.filter(p => p !== position);
    } else {
      sportItem.positions = [...sportItem.positions, position];
    }
    
    // Make sure the updated array is properly set
    updatedSports[index] = sportItem;
    setSports([...updatedSports]); // Create a new array to ensure state update
  };

  const handleCurrentSportChange = (e) => {
    setCurrentSport(e.target.value);
    setCurrentPosition([]);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const userData = JSON.parse(localStorage.getItem('user'));

    try {
      // Update player profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: userData.id,
          nickname,
          bio,
          avatar_url: profileImage,
          // updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Update player sports
      // First, delete existing sports
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userData.id);

      if (deleteError) throw deleteError;

      // Then insert new sports
      if (sports.length > 0) {
        const { error: sportsError } = await supabase
          .from('users')
          .insert(
            sports.map(sport => ({
              id: userData.id,
              sport: sport.sport,
              positions: sport.positions,
              skill_level: sport.skillLevel
            }))
          );

        if (sportsError) throw sportsError;
      }

      // Update local storage with new profile data
      const updatedUser = {
        ...userData,
        profile: {
          nickname,
          bio,
          profileImage,
          sports,
          updatedAt: new Date().toISOString()
        }
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      setSnackbar({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success'
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Error updating profile. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCancelEdit = () => {
    // Reset form to current values
    if (user?.profile) {
      setNickname(user.profile.nickname || '');
      setSports(user.profile.sports || []);
      setProfileImage(user.profile.profileImage || null);
      setBio(user.profile.bio || '');
    }
    setCurrentSport('');
    setCurrentPosition([]);
    setIsEditing(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Get color for sport
  const getSportColor = (sportName) => {
    return sportColorMap[sportName] || sportColorMap['Other'];
  };

  // Add function to update skill level for a specific sport
  const handleUpdateSportSkillLevel = (index, level) => {
    const updatedSports = [...sports];
    updatedSports[index].skillLevel = level;
    setSports(updatedSports);
  };

  // Improved sport section rendering
  const renderSports = () => {
    console.log(sports);
    if (!isEditing) {
      // Read-only view
      return (
        <Grid container spacing={3}>
          {sports.length > 0 ? (
            sports.map((sportItem, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  elevation={2}
                  sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6,
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      height: 100, 
                      background: `linear-gradient(135deg, ${getSportColor(sportItem.sport)} 0%, ${getSportColor(sportItem.sport)}99 100%)`,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'flex-end',
                      pb: 1
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 2,
                        color: getSportColor(sportItem.sport)
                      }}
                    >
                      {getSportIcon(sportItem.sport)}
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ color: '#fff', fontWeight: 700, px: 3 }}>
                      {sportItem.sport}
                    </Typography>
                  </Box>
                  <CardContent sx={{ pt: 2, pb: 3 }}>
                    {Array.isArray(sportItem.positions) && sportItem.positions.length > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, flexWrap: 'wrap', gap: 1 }}>
                        {sportItem.positions.map(position => (
                          <Chip 
                            key={position}
                            label={position} 
                            sx={{ 
                              fontWeight: 500,
                              bgcolor: 'rgba(0,0,0,0.06)',
                              borderRadius: 2
                            }} 
                          />
                        ))}
                      </Box>
                    ) : sportItem.position ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={sportItem.position} 
                          sx={{ 
                            fontWeight: 500,
                            bgcolor: 'rgba(0,0,0,0.06)',
                            borderRadius: 2
                          }} 
                        />
                      </Box>
                    ) : null}
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 3,
                  textAlign: 'center',
                  bgcolor: 'rgba(0,0,0,0.02)',
                  border: '1px dashed',
                  borderColor: 'divider'
                }}
              >
                <Typography  sx={{ mb: 2 }}>
                  You haven't added any sports to your profile yet.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setIsEditing(true)}
                  startIcon={<AddIcon />}
                >
                  Add Your First Sport
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      );
    }
    
    // Edit mode with modern card design
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ 
          borderBottom: '2px solid', 
          borderColor: 'primary.main',
          paddingBottom: 1,
          display: 'inline-block'
        }}>
          Your Sports
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {sports.map((sportItem, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <SportCard>
                <SportGradientHeader sportColor={getSportColor(sportItem.sport)}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#fff', 
                      position: 'absolute',
                      bottom: 12,
                      left: 20,
                      fontWeight: 'bold',
                      textShadow: '0px 2px 3px rgba(0,0,0,0.2)'
                    }}
                  >
                    {sportItem.sport}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveSport(index)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      color: 'white',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      }
                    }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </SportGradientHeader>
                
                <SportIconWrapper sportColor={getSportColor(sportItem.sport)}>
                  {getSportIcon(sportItem.sport)}
                </SportIconWrapper>
                
                <CardContent sx={{ pt: 3, pb: 2, px: 3 }}>
                  {/* Add skill level selection per sport */}
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Typography variant="subtitle2"  gutterBottom>
                      Skill Level
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                      <Select
                        value={sportItem.skillLevel || 'Beginner'}
                        onChange={(e) => handleUpdateSportSkillLevel(index, e.target.value)}
                      >
                        {skillLevels.map((level) => (
                          <MenuItem key={level} value={level}>{level}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {/* Position selection */}
                  {positions[sportItem.sport] && positions[sportItem.sport].length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2"  gutterBottom>
                        Select Your Position(s)
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {positions[sportItem.sport].map((position) => (
                          <PositionChip
                            key={position}
                            label={position}
                            clickable
                            active={
                              Array.isArray(sportItem.positions) 
                                ? sportItem.positions.includes(position)
                                : sportItem.position === position // For backward compatibility
                            }
                            onClick={() => handleUpdateSportPosition(index, position)}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </SportCard>
            </Grid>
          ))}
          
          {/* Add sport card/button */}
          <Grid item xs={12} sm={6} md={4}>
            {showSportForm ? (
              <SportFormPopup elevation={3}>
                <Typography variant="h6" gutterBottom>
                  Add a New Sport
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2"  gutterBottom>
                    Select Sport
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {sportOptions.map((sport) => (
                      <Chip
                        key={sport}
                        label={sport}
                        icon={
                          <Box sx={{ display: 'flex', color: currentSport === sport ? '#fff' : getSportColor(sport) }}>
                            {getSportIcon(sport)}
                          </Box>
                        }
                        onClick={() => handleCurrentSportChange({ target: { value: sport } })}
                        sx={{
                          py: 2.5,
                          px: 1,
                          fontWeight: 500,
                          backgroundColor: currentSport === sport ? getSportColor(sport) : 'transparent',
                          color: currentSport === sport ? '#fff' : 'text.primary',
                          border: `1px solid ${currentSport === sport ? getSportColor(sport) : 'rgba(0,0,0,0.12)'}`,
                          '&:hover': {
                            backgroundColor: currentSport === sport ? getSportColor(sport) : 'rgba(0,0,0,0.04)',
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
                
                {currentSport && positions[currentSport] && positions[currentSport].length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2"  gutterBottom>
                      Select Position(s)
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {positions[currentSport].map((position) => (
                        <Chip
                          key={position}
                          label={position}
                          onClick={() => handleCurrentPositionToggle(position)}
                          sx={{
                            fontWeight: 500,
                            backgroundColor: currentPosition.includes(position) ? 'primary.main' : 'transparent',
                            color: currentPosition.includes(position) ? '#fff' : 'text.primary',
                            border: `1px solid ${currentPosition.includes(position) ? 'primary.main' : 'rgba(0,0,0,0.12)'}`,
                            '&:hover': {
                              backgroundColor: currentPosition.includes(position) ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                            }
                          }}
                        />
                      ))}
                    </Box>
                    <Typography variant="caption"  sx={{ display: 'block', mt: 1 }}>
                      {currentPosition.length === 0 ? 
                        "You can select multiple positions" : 
                        `Selected: ${currentPosition.join(', ')}`}
                    </Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setShowSportForm(false);
                      setCurrentSport('');
                      setCurrentPosition([]);  // Reset as empty array
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={() => {
                      handleAddSport();
                      if (currentSport) {
                        setShowSportForm(false);
                        setCurrentSport('');
                        setCurrentPosition([]);  // Reset as empty array
                      }
                    }}
                    disabled={!currentSport}
                    startIcon={<AddIcon />}
                  >
                    Add Sport
                  </Button>
                </Box>
              </SportFormPopup>
            ) : (
              <Box 
                sx={{ 
                  height: '100%', 
                  minHeight: 220,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 3,
                  p: 2
                }}
              >
                <AddSportButton
                  onClick={() => setShowSportForm(true)}
                  startIcon={<AddIcon />}
                  fullWidth
                >
                  Add a Sport
                </AddSportButton>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5">Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ProfileHeader elevation={1}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Box position="relative">
                <ProfileAvatar
                  src={profileImage || user?.photoURL || '/assets/images/avatar.jpg'}
                  alt={user?.name || 'User Avatar'}
                />
                {isEditing && (
                  <Box
                    position="absolute"
                    bottom={0}
                    right={0}
                    bgcolor="background.paper"
                    borderRadius="50%"
                    boxShadow={2}
                  >
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="label"
                      size="small"
                    >
                      <VisuallyHiddenInput
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                      <PhotoCameraIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" component="h1" gutterBottom>
                {user?.name || 'User Profile'}
              </Typography>
              {user?.email && (
                <Typography variant="body1" >
                  {user.email}
                </Typography>
              )}
            </Grid>
          </Grid>
        </ProfileHeader>

        <Paper 
          sx={{ 
            width: '100%', 
            mb: 3, 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px'
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="profile tabs"
            centered
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 64,
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: 'primary.main',
                  backgroundColor: 'rgba(0,0,0,0.02)'
                }
              }
            }}
          >
            <Tab icon={<EditIcon />} label="PROFILE" iconPosition="start" />
            <Tab icon={<StatsIcon />} label="STATS" iconPosition="start" />
            <Tab icon={<SettingsIcon />} label="SETTINGS" iconPosition="start" />
          </Tabs>

          <TabPanel value={tabValue} index={0} style={{padding: '24px 32px'}}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{ 
                    px: 3, 
                    py: 1.2,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontWeight: 600
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    sx={{ 
                      px: 3, 
                      py: 1.2,
                      borderRadius: 2,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontWeight: 600
                    }}
                  >
                    Save
                  </Button>
                </Stack>
              )}
            </Box>

            {isEditing ? (
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                  {/* Basic profile section */}
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ 
                      borderBottom: '2px solid', 
                      borderColor: 'primary.main',
                      paddingBottom: 1,
                      display: 'inline-block'
                    }}>
                      Basic Information
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="What should we call you?"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <Box component="span" sx={{ mr: 1, color: 'text.secondary' }}>
                            @
                          </Box>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      variant="outlined"
                      multiline
                      rows={4}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  
                  {/* Render the enhanced sports section */}
                  <Grid item xs={12}>
                    {renderSports()}
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      borderRadius: 3,
                      boxShadow: 'rgba(0, 0, 0, 0.04) 0px 6px 24px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px',
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ p: 2, background: 'linear-gradient(45deg, #f3f4f6 0%, #ffffff 100%)' }}>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        Personal Info
                      </Typography>
                    </Box>
                    <Divider />
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={3}>
                        <Box>
                          <Typography variant="subtitle2"  gutterBottom>
                            Full Name
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {user?.name}
                          </Typography>
                        </Box>
                        
                        {nickname && (
                          <Box>
                            <Typography variant="subtitle2"  gutterBottom>
                              Nickname
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {nickname}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box>
                          <Typography variant="subtitle2"  gutterBottom>
                            Email
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {user?.email || 'Not provided'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      borderRadius: 3,
                      boxShadow: 'rgba(0, 0, 0, 0.04) 0px 6px 24px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px',
                      overflow: 'hidden',
                      height: '100%'
                    }}
                  >
                    <Box sx={{ p: 2, background: 'linear-gradient(45deg, #f3f4f6 0%, #ffffff 100%)' }}>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        Sport Information
                      </Typography>
                    </Box>
                    <Divider />
                    <CardContent sx={{ p: 3 }}>
                      {sports && sports.length > 0 ? (
                        <Stack spacing={2.5}>
                          {sports.map((sportItem, index) => (
                            <Box key={index}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar 
                                  sx={{ 
                                    bgcolor: getSportColor(sportItem.sport),
                                    mr: 2,
                                    width: 36,
                                    height: 36
                                  }}
                                >
                                  {getSportIcon(sportItem.sport)}
                                </Avatar>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {sportItem.sport}
                                </Typography>
                                {sportItem.skillLevel && (
                                  <Chip 
                                    label={sportItem.skillLevel}
                                    size="small"
                                    sx={{ 
                                      ml: 1,
                                      fontWeight: 500,
                                      backgroundColor: 'primary.main',
                                      color: 'white'
                                    }} 
                                  />
                                )}
                              </Box>
                              
                              {Array.isArray(sportItem.positions) && sportItem.positions.length > 0 && (
                                <Box sx={{ pl: 7, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {sportItem.positions.map(position => (
                                    <Chip 
                                      key={position}
                                      label={position} 
                                      size="small"
                                      sx={{ 
                                        fontWeight: 500,
                                        backgroundColor: 'rgba(0,0,0,0.05)'
                                      }} 
                                    />
                                  ))}
                                </Box>
                              )}
                              
                              {index < sports.length - 1 && <Divider sx={{ my: 2 }} />}
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          p: 3
                        }}>
                          <Typography variant="body1"  paragraph>
                            No sport information added yet
                          </Typography>
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setIsEditing(true)}
                          >
                            Add Sports
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                
                {bio && (
                  <Grid item xs={12}>
                    <Card 
                      variant="outlined"
                      sx={{ 
                        borderRadius: 3,
                        boxShadow: 'rgba(0, 0, 0, 0.04) 0px 6px 24px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px',
                        overflow: 'hidden'
                      }}
                    >
                      <Box sx={{ p: 2, background: 'linear-gradient(45deg, #f3f4f6 0%, #ffffff 100%)' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                          Bio
                        </Typography>
                      </Box>
                      <Divider />
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="body1" paragraph>
                          {bio}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1} style={{padding: '0px 16px'}}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Participation & Reliability
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <Grid container spacing={3}>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center" p={2}>
                          <Typography variant="h4" color="primary">
                            {playerStats.gamesJoined}
                          </Typography>
                          <Typography variant="body2" >
                            Games Joined
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center" p={2}>
                          <Typography variant="h4" color="success.main">
                            {playerStats.gamesAttended}
                          </Typography>
                          <Typography variant="body2" >
                            Games Attended
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center" p={2}>
                          <Typography variant="h4" color="error.main">
                            {playerStats.noShows}
                          </Typography>
                          <Typography variant="body2" >
                            No-Shows
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center" p={2}>
                          <Typography variant="h4" color="warning.main">
                            {playerStats.lastMinuteCancellations}
                          </Typography>
                          <Typography variant="body2" >
                            Late Cancels
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Reliability Score
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: 150 }}>
                      <Avatar
                        sx={{
                          width: 100,
                          height: 100,
                          bgcolor: playerStats.reliabilityScore > 90 ? green[500] : 
                                  playerStats.reliabilityScore > 70 ? blue[500] : 
                                  playerStats.reliabilityScore > 50 ? 'orange' : 'red',
                          fontSize: '2rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {playerStats.reliabilityScore}%
                      </Avatar>
                    </Box>
                    <Typography variant="body2"  align="center" sx={{ mt: 2 }}>
                      Shows up {Math.round((playerStats.gamesAttended / playerStats.gamesJoined) * 100)}% of the time
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Participation Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box p={1}>
                          <Typography variant="body2" >
                            Current Streak
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {playerStats.activeStreak} games
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box p={1}>
                          <Typography variant="body2" >
                            Activity Level
                          </Typography>
                          <Typography variant="h6" color={
                            playerStats.recentActivity === 'Very Active' ? 'success.main' :
                            playerStats.recentActivity === 'Active' ? 'primary.main' :
                            playerStats.recentActivity === 'Occasional' ? 'warning.main' : 'text.secondary'
                          }>
                            {playerStats.recentActivity}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box p={1}>
                          <Typography variant="body2" >
                            Total Hours Played
                          </Typography>
                          <Typography variant="h6">
                            {playerStats.totalHoursPlayed} hrs
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box p={1}>
                          <Typography variant="body2" >
                            Attendance Rate
                          </Typography>
                          <Typography variant="h6" color={
                            (playerStats.gamesAttended / playerStats.gamesJoined) > 0.9 ? 'success.main' :
                            (playerStats.gamesAttended / playerStats.gamesJoined) > 0.7 ? 'primary.main' : 'warning.main'
                          }>
                            {Math.round((playerStats.gamesAttended / playerStats.gamesJoined) * 100)}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Tips to Improve Your Reliability
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box p={1}>
                      <Typography component="ul" sx={{ pl: 2 }}>
                        <li>
                          <Typography variant="body2" paragraph>
                            Cancel at least 24 hours before a game if you can't make it
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2" paragraph>
                            Arrive on time to maintain your reliability score
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2" paragraph>
                            Join games consistently to increase your activity level
                          </Typography>
                        </li>
                        <li>
                          <Typography variant="body2">
                            Update your availability calendar to get matched with games that fit your schedule
                          </Typography>
                        </li>
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3} style={{padding: '0px 16px'}}>
            <Typography variant="h6" gutterBottom>
              Account Settings
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="body1"  align="center" sx={{ py: 4 }}>
              Account settings functionality coming soon!
            </Typography>
          </TabPanel>
        </Paper>
      </Container>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
} 