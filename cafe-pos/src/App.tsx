import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Tabs, 
  Tab, 
  Card, 
  CardContent, 
  Button,
  IconButton,
  Divider,
  List,
  ListItem,
  Paper,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Drawer,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Snackbar,
  Alert,
  Slide
} from '@mui/material';
import { 
  LocalCafe as LocalCafeIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
// Removed default MenuIcon in favor of custom modern hamburger
import { useStore } from './store/useStore';
import { CartItem } from './types';
import { getDatabaseIPC } from './services/database-ipc';
import LoginScreen from './components/LoginScreen';
import SplashScreen from './components/SplashScreen';
import LogoutConfirmDialog from './components/LogoutConfirmDialog';
import PaymentDialog from './components/PaymentDialog';
import ReceiptPreview from './components/ReceiptPreview';
import AdminPanel from './components/AdminPanel';
import AdminDashboard from './components/AdminDashboard';
import VirtualKeyboard from './components/VirtualKeyboard';

// Modern yeşil tema - #0a4940
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0a4940',
      light: '#2e6b63',
      dark: '#053429',
    },
    secondary: {
      main: '#4caf50',
    },
    background: {
      default: '#f8fffe',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
    },
    success: {
      main: '#0a4940',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(10, 73, 64, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.04)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          minHeight: 60,
        },
      },
    },
  },
});

// Modern hamburger icon with morph-to-X animation
const HamburgerIcon: React.FC<{ active?: boolean }> = ({ active = false }) => {
  const barCommon = {
    width: 24,
    height: 3,
    borderRadius: 2,
    background: 'linear-gradient(90deg, #0a4940 0%, #2e6b63 100%)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
    transition: 'transform 220ms ease, opacity 220ms ease, width 220ms ease',
  } as const;

  return (
    <Box sx={{ width: 28, height: 22, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
      <Box className="ham-bar" sx={{
        ...barCommon,
        transform: active ? 'translateY(7px) rotate(45deg)' : 'translateY(0) rotate(0deg)'
      }} />
      <Box className="ham-bar" sx={{
        ...barCommon,
        width: active ? 0 : 20,
        opacity: active ? 0 : 1
      }} />
      <Box className="ham-bar" sx={{
        ...barCommon,
        transform: active ? 'translateY(-7px) rotate(-45deg)' : 'translateY(0) rotate(0deg)'
      }} />
    </Box>
  );
};

const MainApp: React.FC = () => {
  const {
    categories,
    selectedCategory,
    cart,
    setSelectedCategory,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getProductsByCategory,
    showLogoutDialog,
    startPayment,
    showReceiptPreview,
    receiptData,
    hideReceiptPreview,
    showAdminPanel,
    showAdminPanelDialog,
    hideAdminPanel,
    loadData,
  } = useStore();

  const [showDashboard, setShowDashboard] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = React.useState(false);
  const [showSizeDialog, setShowSizeDialog] = React.useState(false);
  const [sizeSelectProduct, setSizeSelectProduct] = React.useState<any | null>(null);
  const [selectedSizeId, setSelectedSizeId] = React.useState<string | null>(null);

  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [showTables, setShowTables] = React.useState(false);
  const [showTableSelection, setShowTableSelection] = React.useState(false);
  const [selectedTableNumber, setSelectedTableNumber] = React.useState<number | null>(null);
  const [tableOrders, setTableOrders] = React.useState<{[key: number]: {items: any[], total: number, startTime: Date}}>({});
  const [showTableDetail, setShowTableDetail] = React.useState(false);
  const [selectedTableForDetail, setSelectedTableForDetail] = React.useState<number | null>(null);
  const [isAddingToTable, setIsAddingToTable] = React.useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [toastOpen, setToastOpen] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastSeverity, setToastSeverity] = React.useState<'success' | 'error' | 'warning' | 'info'>('success');

  // Verileri uygulama başlarken yükle
  React.useEffect(() => {
    loadData();
    loadTableOrders();
  }, [loadData]);

  // Masa siparişlerini veritabanından yükle
  const loadTableOrders = async () => {
    console.log('🔄 Masa siparişleri yükleniyor...');
    try {
      const db = getDatabaseIPC();
      const activeOrders = await db.getActiveTableOrders();
      console.log('✅ Masa siparişleri yüklendi:', activeOrders);
      setTableOrders(activeOrders);
    } catch (error: any) {
      console.error('❌ Masa siparişleri yüklenirken hata:', error);
    }
  };

  // Saati gerçek zamanlı güncelle
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Her saniye güncelle

    return () => clearInterval(timer);
  }, []);

  // Tam ekran durumunu kontrol et
  React.useEffect(() => {
    const checkFullscreen = async () => {
      try {
        if (window.electronAPI) {
          const fullscreen = await window.electronAPI.isFullscreen();
          setIsFullscreen(fullscreen);
        }
      } catch (error: any) {
        console.error('Tam ekran durumu kontrol hatası:', error);
      }
    };
    
    checkFullscreen();
    
    // Düzenli olarak tam ekran durumunu kontrol et (daha az sıklıkta)
    const interval = setInterval(checkFullscreen, 2000);
    return () => clearInterval(interval);
  }, []);

  // Tam ekran toggle fonksiyonu
  const toggleFullscreen = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.toggleFullscreen();
        // Hemen durum güncellemesi yap
        setTimeout(async () => {
          try {
            const fullscreen = await window.electronAPI.isFullscreen();
            setIsFullscreen(fullscreen);
          } catch (error: any) {
            console.error('Tam ekran durumu güncelleme hatası:', error);
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('Tam ekran toggle hatası:', error);
    }
  };

  const openHeaderDrawer = () => setDrawerOpen(true);
  const closeHeaderDrawer = () => setDrawerOpen(false);

  const currentProducts = getProductsByCategory(selectedCategory);
  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);

  // Arama fonksiyonu
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return currentProducts;
    }
    
    return currentProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [currentProducts, searchQuery]);

  // Arama kutusunu temizleme
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Sanal klavye fonksiyonları
  const handleVirtualKeyPress = (key: string) => {
    setSearchQuery(prev => prev + key);
  };

  const handleVirtualBackspace = () => {
    setSearchQuery(prev => prev.slice(0, -1));
  };

  const handleVirtualClear = () => {
    setSearchQuery('');
  };

  const openVirtualKeyboard = () => {
    setShowVirtualKeyboard(true);
  };

  const closeVirtualKeyboard = () => {
    setShowVirtualKeyboard(false);
  };

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategory(newValue);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  const openSizeSelection = (product: any) => {
    setSizeSelectProduct(product);
    const defaultSize = product?.sizes?.find((s: any) => s.id === 'medium') || product?.sizes?.[0] || null;
    setSelectedSizeId(defaultSize ? defaultSize.id : null);
    setShowSizeDialog(true);
  };

  const closeSizeSelection = () => {
    setShowSizeDialog(false);
    setSizeSelectProduct(null);
    setSelectedSizeId(null);
  };

  const handleAddProduct = (product: any) => {
    if (product?.sizes && product.sizes.length > 0) {
      openSizeSelection(product);
    } else {
      addToCart(product);
    }
  };

  const SlideLeft = (props: any) => <Slide {...props} direction="left" />;
  const showToast = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

      return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh', 
        width: '100vw',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ px: 3, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
            <Box
              component="img"
              src={require('./assets/Logo.png')}
              alt="Lacromisa Coffee Logo"
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                mr: 2,
                boxShadow: '0 2px 8px rgba(10, 73, 64, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.8)'
              }}
            />
            <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
              Lacromisa Coffee
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />

          {/* Ürünler ve Masalar Butonları - Yatayda tam ortalanmış */}
          <Box sx={{ 
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', 
            alignItems: 'center', 
            gap: 2
          }}>
            {/* Ürünler Butonu */}
            <Button
              onClick={() => setShowTables(false)}
              variant={!showTables ? "contained" : "outlined"}
              sx={{
                background: !showTables ? 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)' : 'rgba(255, 255, 255, 0.9)',
                color: !showTables ? 'white' : '#0a4940',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: !showTables ? '0 4px 15px rgba(10, 73, 64, 0.3)' : 'none',
                fontSize: '1rem',
                minWidth: '120px',
                border: '2px solid #0a4940',
                '&:hover': {
                  background: !showTables ? 'linear-gradient(135deg, #053429 0%, #0a4940 100%)' : '#0a4940',
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(10, 73, 64, 0.4)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              🍽️ Ürünler
            </Button>
            
            {/* Masalar Butonu */}
            <Button
              onClick={() => setShowTables(!showTables)}
              variant={showTables ? "contained" : "outlined"}
              sx={{
                color: showTables ? 'white' : '#0a4940',
                border: '2px solid #0a4940',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
                minWidth: '120px',
                bgcolor: showTables ? 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)' : 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  bgcolor: showTables ? 'linear-gradient(135deg, #053429 0%, #0a4940 100%)' : '#0a4940',
                  color: 'white',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(10, 73, 64, 0.3)',
                  border: '2px solid #0a4940'
                },
                transition: 'all 0.3s ease'
              }}
            >
              🪑 Masalar
            </Button>
          </Box>
          
          {/* Sağ üst hamburger menü */}
          <Tooltip title="Menü">
            <IconButton
              onClick={openHeaderDrawer}
              sx={{
                ml: 2,
                bgcolor: 'rgba(10, 73, 64, 0.1)',
                color: '#0a4940',
                border: '2px solid #0a4940',
                width: 56,
                height: 56,
                '&:hover': {
                  bgcolor: '#0a4940',
                  color: 'white',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              <HamburgerIcon active={drawerOpen} />
            </IconButton>
          </Tooltip>

          {/* Sağdan kayan yarı panel (Drawer) */}
          <Drawer
            anchor="right"
            open={drawerOpen}
            onClose={closeHeaderDrawer}
            PaperProps={{
              sx: {
                width: { xs: '88vw', sm: 420 },
                borderTopLeftRadius: 16,
                borderBottomLeftRadius: 16,
                background: 'linear-gradient(135deg, #ffffff 0%, #f6fbfa 100%)'
              }
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>Menü</Typography>
                <IconButton onClick={closeHeaderDrawer}>
                  <ClearIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderRadius: 2, bgcolor: 'grey.50', mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>🕐 {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>📅 {currentTime.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</Typography>
              </Box>
              <Divider />
              <Box sx={{ mt: 1 }}>
                <MenuItem onClick={() => { setShowDashboard(true); closeHeaderDrawer(); }} sx={{ py: 1.5, borderRadius: 2 }}>
                  <ListItemIcon>
                    <AnalyticsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Admin Dashboard" />
                </MenuItem>
                <MenuItem onClick={() => { showAdminPanelDialog(); closeHeaderDrawer(); }} sx={{ py: 1.5, borderRadius: 2 }}>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Ayarlar" />
                </MenuItem>
              </Box>
            </Box>
          </Drawer>
          {/* Header'daki çıkış butonunu kaldırdık */}
        </Toolbar>
      </AppBar>

      {/* Ana İçerik Alanı */}
      <Container maxWidth="xl" sx={{ flex: 1, mt: 3, mb: 3 }}>
        {showTables ? (
          // Masa Görünümü
          <Paper sx={{ 
            borderRadius: 3, 
            height: 'calc(100vh - 180px)', 
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.default'
          }}>
            {/* Masa Başlığı */}
            <Box sx={{ 
              px: 4, 
              py: 3, 
              borderBottom: 1, 
              borderColor: 'divider',
              background: 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)',
              color: 'white'
            }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                🪑 Masa Yönetimi
                <Typography variant="body1" sx={{ 
                  opacity: 0.9,
                  fontWeight: 500
                }}>
                  Toplam 50 Masa
                </Typography>
              </Typography>
            </Box>

            {/* Masa Grid - Kaydırılabilir */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 4,
              '&::-webkit-scrollbar': {
                width: '12px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#0a4940',
                borderRadius: '6px',
                '&:hover': {
                  background: '#053429',
                },
              },
            }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(5, 1fr)', 
                gap: 4,
                pb: 4
              }}>
                {Array.from({ length: 50 }, (_, index) => {
                  const tableNumber = index + 1;
                  const tableOrder = tableOrders[tableNumber];
                  const isOccupied = !!tableOrder;
                  
                  return (
                    <Card 
                      key={tableNumber}
                      onClick={() => {
                        setSelectedTableForDetail(tableNumber);
                        setShowTableDetail(true);
                      }}
                      sx={{ 
                        aspectRatio: '1',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: isOccupied 
                          ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
                          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        color: isOccupied ? 'white' : '#0a4940',
                        border: '3px solid',
                        borderColor: isOccupied ? '#ff4757' : '#e9ecef',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        '&:hover': {
                          transform: 'translateY(-6px) scale(1.03)',
                          boxShadow: '0 12px 30px rgba(10, 73, 64, 0.15)',
                          border: '3px solid',
                          borderColor: isOccupied ? '#ff3742' : '#0a4940',
                          background: isOccupied 
                            ? 'linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)'
                            : 'linear-gradient(135deg, #ffffff 0%, #f0f8f6 100%)',
                        }
                      }}
                    >
                      <CardContent sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 3,
                        textAlign: 'center'
                      }}>
                        {/* Masa Numarası */}
                        <Typography variant="h3" sx={{ 
                          fontWeight: 800,
                          fontSize: '2.5rem',
                          color: isOccupied ? 'white' : '#0a4940',
                          textShadow: isOccupied 
                            ? '0 2px 4px rgba(0,0,0,0.3)'
                            : '0 2px 4px rgba(10, 73, 64, 0.1)'
                        }}>
                          {tableNumber}
                        </Typography>
                        
                        {/* Durum İkonu */}
                        <Box
                          component="img"
                          src={require('./assets/Table.png')}
                          alt="Masa"
                          sx={{
                            width: '60px',
                            height: '60px',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                            opacity: 0.9
                          }}
                        />
                        
                        {/* Durum Bilgisi */}
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: isOccupied ? 'white' : '#0a4940',
                            opacity: 0.9
                          }}>
                            {isOccupied ? 'DOLU' : 'BOŞ'}
                          </Typography>
                          
                          {isOccupied ? (
                            <>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                opacity: 0.8,
                                mt: 0.5
                              }}>
                                {tableOrder.items.length} Ürün
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                opacity: 0.9,
                                mt: 0.5
                              }}>
                                {formatPrice(tableOrder.total)}
                              </Typography>
                            </>
                          ) : (
                            <Typography variant="body2" sx={{ 
                              fontWeight: 500,
                              fontSize: '0.85rem',
                              color: '#666666',
                              mt: 0.5
                            }}>
                              Sipariş için tıklayın
                            </Typography>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          </Paper>
        ) : (
          // Normal Ürün Görünümü
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1.2fr', 
            gap: 4, 
            height: '100%' 
          }}>
            
            {/* Sol Panel - Ürünler */}
            <Paper sx={{ 
              borderRadius: 3, 
              height: 'calc(100vh - 180px)', 
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
            {/* Kategori Sekmeleri ve Arama - Sabit */}
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: 'divider', 
              px: 3, 
              pt: 3,
              pb: 2,
              flexShrink: 0,
              background: 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)'
            }}>
              <Tabs 
                value={selectedCategory} 
                onChange={handleCategoryChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ 
                  minHeight: 60,
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    minHeight: 48,
                    borderRadius: 3,
                    margin: '6px 4px',
                    padding: '8px 16px',
                    minWidth: 'auto',
                    transition: 'all 0.3s ease',
                    '&.Mui-selected': {
                      color: '#0a4940',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      transform: 'translateY(-1px)',
                      fontWeight: 700
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-1px)'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none'
                  },
                  '& .MuiTabs-scrollButtons': {
                    color: 'rgba(255, 255, 255, 0.8)',
                    '&.Mui-disabled': {
                      opacity: 0.3
                    }
                  }
                }}
              >
                {categories.map((category) => (
                  <Tab
                    key={category.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '1.5rem' }}>{category.icon}</Typography>
                        <Typography>{category.name}</Typography>
                      </Box>
                    }
                    value={category.id}
                  />
                ))}
              </Tabs>
              
              {/* Modern Arama Kutusu */}
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Ürün ara... (dokunarak klavye açın)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={openVirtualKeyboard}
                  variant="outlined"
                  size="medium"
                  inputProps={{
                    readOnly: true, // Fiziksel klavyeyi devre dışı bırak
                    style: { cursor: 'pointer' }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => {
                            clearSearch();
                            closeVirtualKeyboard();
                          }}
                          size="small"
                          sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: 3,
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderWidth: 2
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.5)'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'white',
                        borderWidth: 2
                      },
                      '& input': {
                        color: 'white',
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          opacity: 1
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Kategori Başlığı - Sabit */}
            <Box sx={{ 
              px: 3, 
              py: 2, 
              flexShrink: 0, 
              bgcolor: 'grey.50',
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <Typography variant="h6" sx={{ 
                color: 'primary.main', 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                {searchQuery ? (
                  <>
                    <SearchIcon sx={{ fontSize: '1.8rem' }} />
                    Arama Sonuçları: "{searchQuery}"
                    <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                      ({filteredProducts.length} sonuç)
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography sx={{ fontSize: '1.8rem' }}>{selectedCategoryData?.icon}</Typography>
                    {selectedCategoryData?.name}
                    <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
                      ({currentProducts.length} ürün)
                    </Typography>
                  </>
                )}
              </Typography>
            </Box>

            {/* Ürün Grid - Kaydırılabilir */}
            <Box sx={{ 
              flex: 1, 
              overflow: 'auto', 
              p: 3,
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '4px',
                '&:hover': {
                  background: '#a8a8a8',
                },
              },
            }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                gap: 2,
                pb: 2
              }}>
                {filteredProducts.length === 0 ? (
                  <Box sx={{ 
                    gridColumn: '1 / -1',
                    textAlign: 'center', 
                    py: 8,
                    color: 'text.secondary'
                  }}>
                    <SearchIcon sx={{ fontSize: '4rem', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {searchQuery ? 'Arama sonucu bulunamadı' : 'Ürün bulunamadı'}
                    </Typography>
                    <Typography variant="body2">
                      {searchQuery ? 
                        `"${searchQuery}" için sonuç bulunamadı. Farklı bir terim deneyin.` : 
                        'Bu kategoride henüz ürün bulunmuyor.'
                      }
                    </Typography>
                    {searchQuery && (
                      <Button 
                        variant="outlined" 
                        onClick={clearSearch}
                        sx={{ mt: 2 }}
                        startIcon={<ClearIcon />}
                      >
                        Aramayı Temizle
                      </Button>
                    )}
                  </Box>
                ) : (
                  filteredProducts.map((product) => (
                  <Card 
                    key={product.id}
                    sx={{ 
                      cursor: 'pointer',
                      height: 'fit-content',
                      minHeight: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      }
                    }}
                    onClick={() => handleAddProduct(product)}
                  >
                    {/* Ürün Görseli */}
                    <Box sx={{ 
                      width: '100%',
                      height: 100,
                      borderRadius: '16px 16px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: (() => {
                        switch(product.category) {
                          case 'hot-drinks': return 'linear-gradient(135deg, #8ba887 0%, #546258 100%)';
                          case 'cold-drinks': return 'linear-gradient(135deg, #87ceea 0%, #1076b4 100%)';
                          case 'desserts': return 'linear-gradient(135deg, #f59e59 0%, #d9534f 100%)';
                          case 'snacks': return 'linear-gradient(135deg, #ffb742 0%, #ff9500 100%)';
                          case 'breakfast': return 'linear-gradient(135deg, #ffdc42 0%, #ffc700 100%)';
                          case 'sandwiches': return 'linear-gradient(135deg, #ffb742 0%, #ff9500 100%)';
                          case 'salads': return 'linear-gradient(135deg, #8bc34a 0%, #5e8a3a 100%)';
                          case 'soups': return 'linear-gradient(135deg, #ff7043 0%, #d84a2b 100%)';
                          case 'healthy': return 'linear-gradient(135deg, #a3d577 0%, #6bb64f 100%)';
                          case 'beverages': return 'linear-gradient(135deg, #61b8ff 0%, #298eff 100%)';
                          case 'turkish-delights': return 'linear-gradient(135deg, #d7871a 0%, #ae6108 100%)';
                          case 'pastries': return 'linear-gradient(135deg, #ffdc42 0%, #ffc700 100%)';
                          default: return 'linear-gradient(135deg, #8ba887 0%, #546258 100%)';
                        }
                      })()
                    }}>
                      {product.image && product.image.startsWith('data:image') ? (
                        // Kullanıcının yüklediği gerçek görsel (Base64)
                        <Box
                          component="img"
                          src={product.image}
                          alt={product.name}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '16px 16px 0 0'
                          }}
                        />
                      ) : product.image && (product.image.includes('espresso.png') || product.image.includes('assets')) ? (
                        // Local asset görseli (espresso.png gibi)
                        <Box
                          component="img"
                          src={product.image}
                          alt={product.name}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '16px 16px 0 0'
                          }}
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            // Hata durumunda emoji göster
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `
                              <div style="
                                display: flex; 
                                align-items: center; 
                                justify-content: center; 
                                width: 100%; 
                                height: 100%; 
                                font-size: 3rem;
                                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3))
                              ">
                                ${(() => {
                                  switch(product.category) {
                                    case 'hot-drinks': return '☕';
                                    case 'cold-drinks': return '🥤';
                                    case 'desserts': return '🍰';
                                    case 'snacks': return '🥨';
                                    case 'breakfast': return '🍳';
                                    default: return '🍽️';
                                  }
                                })()}
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        // Varsayılan durum: Kategori emojisi
                        <Typography sx={{ 
                          fontSize: '3rem',
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                        }}>
                          {(() => {
                            switch(product.category) {
                              case 'hot-drinks': return '☕';
                              case 'cold-drinks': return '🥤';
                              case 'desserts': return '🍰';
                              case 'snacks': return '🥨';
                              case 'breakfast': return '🍳';
                              default: return '🍽️';
                            }
                          })()}
                        </Typography>
                      )}
                    </Box>
                    
                    <CardContent sx={{ 
                      flexGrow: 1, 
                      textAlign: 'center', 
                      p: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ 
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'text.primary',
                        minHeight: '2.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1.2,
                        mb: 1
                      }}>
                        {product.name}
                        {product?.sizes?.length ? (
                          <Box component="span" sx={{
                            ml: 0.75,
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 0.75,
                            py: 0.1,
                            borderRadius: 1,
                            bgcolor: 'rgba(10,73,64,0.08)',
                            color: 'primary.main',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}>
                            Boyut
                            <ChevronRightIcon sx={{ ml: 0.25, fontSize: '1rem' }} />
                          </Box>
                        ) : null}
                      </Typography>
                      
                      <Box>
                        <Typography variant="h6" sx={{ 
                          color: 'primary.main', 
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          mb: 1.5
                        }}>
                          {formatPrice(product.price)}
                        </Typography>
                        
                         <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<AddIcon />}
                          sx={{ 
                            py: 1,
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                             handleAddProduct(product);
                          }}
                        >
                          Ekle
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                  ))
                )}
              </Box>
            </Box>
          </Paper>

          {/* Sağ Panel - Sepet */}
          <Paper sx={{ 
            p: 3, 
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 180px)',
            minHeight: 'calc(100vh - 180px)'
          }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
              🛒 Sipariş Sepeti
            </Typography>
            
            {/* Sepet İçeriği */}
            <Box sx={{ flex: 1, overflow: 'auto', mb: 2, minHeight: '300px' }}>
              {cart.items.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  color: 'text.secondary',
                  py: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Typography sx={{ fontSize: '4rem' }}>🛒</Typography>
                  <Typography variant="body1">
                    Sepetiniz boş
                  </Typography>
                  <Typography variant="body2">
                    Ürün seçerek siparişinizi oluşturun
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {cart.items.map((item) => (
                    <ListItem 
                      key={item.lineId} 
                      sx={{ 
                        p: 0, 
                        mb: 2,
                        border: 1,
                        borderColor: 'grey.200',
                        borderRadius: 2,
                        bgcolor: 'grey.50'
                      }}
                    >
                      <Box sx={{ p: 2, width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                            {item.product.name}{item.selectedSizeName ? ` (${item.selectedSizeName})` : ''}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => removeFromCart(item.lineId)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton 
                              size="small"
                              onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                              sx={{ bgcolor: 'white', border: 1, borderColor: 'grey.300' }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ 
                              minWidth: '30px', 
                              textAlign: 'center', 
                              fontWeight: 600,
                              fontSize: '1.1rem'
                            }}>
                              {item.quantity}
                            </Typography>
                            <IconButton 
                              size="small"
                              onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          
                          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                            {formatPrice((item.unitPrice ?? item.product.price) * item.quantity)}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            
            {/* Toplam ve Ödeme - Her zaman görünür */}
            <Box sx={{ mt: 'auto' }}>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1">
                    Toplam ({cart.items.reduce((sum, item) => sum + item.quantity, 0)} ürün):
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
                    {formatPrice(cart.total)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={clearCart}
                  disabled={cart.items.length === 0}
                  sx={{ flex: 1 }}
                >
                  Temizle
                </Button>
                
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PaymentIcon />}
                  disabled={cart.items.length === 0}
                  sx={{ 
                    flex: 1,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: cart.items.length > 0 
                      ? 'linear-gradient(135deg, #0a4940 0%, #2e6b63 50%, #0a4940 100%)'
                      : 'linear-gradient(135deg, #ccc 0%, #ddd 50%, #ccc 100%)',
                    boxShadow: cart.items.length > 0 
                      ? '0 8px 25px rgba(10, 73, 64, 0.4), 0 4px 10px rgba(0,0,0,0.1)'
                      : '0 4px 10px rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    textTransform: 'none',
                    '&:hover': {
                      background: cart.items.length > 0 
                        ? 'linear-gradient(135deg, #053429 0%, #0a4940 50%, #053429 100%)'
                        : 'linear-gradient(135deg, #ccc 0%, #ddd 50%, #ccc 100%)',
                      boxShadow: cart.items.length > 0 
                        ? '0 12px 35px rgba(10, 73, 64, 0.5), 0 6px 15px rgba(0,0,0,0.15)'
                        : '0 4px 10px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      color: 'rgba(255, 255, 255, 0.6)',
                      transform: 'none'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onClick={async () => {
                    try {
                      console.log('🔄 Sepet ödemesi alınıyor...', { total: cart.total, itemsCount: cart.items.length });
                      
                      const db = getDatabaseIPC();
                      
                      // Satış verisi oluştur
                      const now = new Date();
                      const saleData = {
                        id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        date: now.toISOString().split('T')[0], // YYYY-MM-DD
                        time: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                        totalAmount: cart.total,
                        paymentMethod: 'cash' as const,
                        cashAmount: cart.total,
                        cardAmount: 0,
                        customerCount: 1,
                        notes: 'Sepet ödemesi',
                        createdAt: now.toISOString(),
                        items: cart.items.map((item: any) => ({
                          productId: item.product.id,
                          productName: item.product.name + (item.selectedSizeName ? ` (${item.selectedSizeName})` : ''),
                          quantity: item.quantity,
                          unitPrice: item.unitPrice ?? item.product.price,
                          totalPrice: (item.unitPrice ?? item.product.price) * item.quantity,
                          category: item.product.category
                        }))
                      };
                      
                      console.log('📊 Sepet satış verisi oluşturuldu:', saleData);
                      
                      // Satışı kaydet
                      const saleSuccess = await db.saveSale(saleData);
                      
                      if (saleSuccess) {
                        console.log('✅ Sepet satışı başarıyla kaydedildi');
                        // Ödeme dialogunu aç
                        startPayment(cart.total);
                      } else {
                        console.error('❌ Sepet satışı kaydedilemedi');
                      }
                    } catch (error: any) {
                      console.error('❌ Sepet ödeme hatası:', error);
                    }
                  }}
                >
                  Ödeme Al
                </Button>
                
                <Button
                  variant="contained"
                  size="large"
                  disabled={cart.items.length === 0}
                  startIcon={
                    <Box
                      component="img"
                      src={require('./assets/Table.png')}
                      alt="Masa"
                      sx={{
                        width: '24px',
                        height: '24px',
                        filter: 'brightness(0) invert(1)',
                        opacity: 0.9
                      }}
                    />
                  }
                  sx={{ 
                    flex: 1,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: cart.items.length > 0 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)'
                      : 'linear-gradient(135deg, #ccc 0%, #ddd 50%, #ccc 100%)',
                    boxShadow: cart.items.length > 0 
                      ? '0 8px 25px rgba(102, 126, 234, 0.4), 0 4px 10px rgba(0,0,0,0.1)'
                      : '0 4px 10px rgba(0,0,0,0.1)',
                    borderRadius: 3,
                    textTransform: 'none',
                    '&:hover': {
                      background: cart.items.length > 0 
                        ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 50%, #5a67d8 100%)'
                        : 'linear-gradient(135deg, #ccc 0%, #ddd 50%, #ccc 100%)',
                      boxShadow: cart.items.length > 0 
                        ? '0 12px 35px rgba(102, 126, 234, 0.5), 0 6px 15px rgba(0,0,0,0.15)'
                        : '0 4px 10px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    },
                    '&:disabled': {
                      color: 'rgba(255, 255, 255, 0.6)',
                      transform: 'none'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onClick={() => {
                    setShowTableSelection(true);
                  }}
                >
                  Masaya
                </Button>
              </Box>
              
              {/* Masa X için Kaydet Butonu - Sadece isAddingToTable varsa görünür */}
              {isAddingToTable && (
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  sx={{ 
                    mb: 2,
                    py: 1.5,
                    fontSize: '1.1rem',
                    background: 'linear-gradient(45deg, #ff6b6b 30%, #ee5a52 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #ff5252 30%, #d32f2f 90%)',
                    }
                  }}
                  onClick={async () => {
                    if (isAddingToTable) {
                      try {
                        const db = getDatabaseIPC();
                        const success = await db.addToTableOrder(isAddingToTable, cart.items, cart.total);
                        
                        if (success) {
                          // State'i güncelle
                          setTableOrders(prev => ({
                            ...prev,
                            [isAddingToTable]: {
                              items: [...(prev[isAddingToTable]?.items || []), ...cart.items],
                              total: (prev[isAddingToTable]?.total || 0) + cart.total,
                              startTime: prev[isAddingToTable]?.startTime || new Date()
                            }
                          }));
                          // Sepeti temizle
                          clearCart();
                          // isAddingToTable'ı sıfırla
                          setIsAddingToTable(null);
                        }
                      } catch (error: any) {
                        console.error('Masaya sipariş ekleme hatası:', error);
                      }
                    }
                  }}
                >
                  🪑 Masa {isAddingToTable} için Kaydet
                </Button>
              )}
            </Box>
            
            {/* Çıkış Butonu - Her zaman göster */}
            <Divider sx={{ my: 2 }} />
            <Button
              variant="contained"
              color="error"
              fullWidth
              size="large"
              startIcon={<LogoutIcon />}
              onClick={showLogoutDialog}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #b71c1c 30%, #d32f2f 90%)',
                }
              }}
            >
              Çıkış Yap
            </Button>
          </Paper>
        </Box>
        )}
      </Container>
        
        {/* Çıkış Onay Dialog */}
        <LogoutConfirmDialog />
        
        {/* Ödeme Dialog */}
        <PaymentDialog />
        
        {/* Fiş Önizleme Dialog */}
        <ReceiptPreview
          open={showReceiptPreview}
          onClose={hideReceiptPreview}
          items={receiptData?.items || []}
          totalAmount={receiptData?.totalAmount || 0}
          paymentMethod={receiptData?.paymentMethod || ''}
        />
        
        {/* Admin Panel Dialog */}
        <AdminPanel 
          open={showAdminPanel}
          onClose={hideAdminPanel}
        />

        {/* Admin Dashboard Dialog */}
        <AdminDashboard 
          open={showDashboard}
          onClose={() => setShowDashboard(false)}
        />

        {/* Sanal Klavye */}
        <VirtualKeyboard
          open={showVirtualKeyboard}
          onClose={closeVirtualKeyboard}
          onKeyPress={handleVirtualKeyPress}
          onBackspace={handleVirtualBackspace}
          onClear={handleVirtualClear}
          currentValue={searchQuery}
        />

          {/* Boyut Seçim Dialog */}
          <Dialog
            open={showSizeDialog}
            onClose={closeSizeSelection}
            maxWidth="xs"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
              }
            }}
          >
            <DialogTitle sx={{ fontWeight: 700 }}>Boyut Seçin</DialogTitle>
            <DialogContent sx={{ pb: 0 }}>
              {sizeSelectProduct && sizeSelectProduct.sizes && sizeSelectProduct.sizes.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {sizeSelectProduct.sizes.map((s: any) => (
                    <Button
                      key={s.id}
                      variant={selectedSizeId === s.id ? 'contained' : 'outlined'}
                      onClick={() => setSelectedSizeId(s.id)}
                      sx={{ justifyContent: 'space-between' }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>{s.name}</Typography>
                      <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>{formatPrice(s.price)}</Typography>
                    </Button>
                  ))}
                </Box>
              ) : (
                <Typography>Bu ürün için boyut bulunmuyor.</Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={closeSizeSelection} variant="outlined">İptal</Button>
              <Button
                onClick={() => {
                  if (sizeSelectProduct && selectedSizeId) {
                    addToCart(sizeSelectProduct, { sizeId: selectedSizeId });
                    closeSizeSelection();
                  }
                }}
                variant="contained"
                disabled={!selectedSizeId}
              >
                Ekle
              </Button>
            </DialogActions>
          </Dialog>

        {/* Masa Seçim Dialog */}
        <Dialog
          open={showTableSelection}
          onClose={() => setShowTableSelection(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)',
            color: 'white',
            textAlign: 'center',
            fontWeight: 700
          }}>
            🪑 Masa Seçimi
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            {/* Sepet Özeti */}
                     <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                📋 Sipariş Özeti
              </Typography>
              <List sx={{ p: 0 }}>
                {cart.items.map((item) => (
                  <ListItem key={item.lineId} sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.product.name}{item.selectedSizeName ? ` (${item.selectedSizeName})` : ''} x{item.quantity}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {formatPrice((item.unitPrice ?? item.product.price) * item.quantity)}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Toplam Tutar:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatPrice(cart.total)}
                </Typography>
              </Box>
            </Box>

            {/* Masa Seçimi */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                🪑 Masa Seçin
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={selectedTableNumber || ''}
                  onChange={(e) => setSelectedTableNumber(e.target.value as number)}
                  displayEmpty
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0a4940',
                      borderWidth: 2
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0a4940'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#0a4940',
                      borderWidth: 2
                    }
                  }}
                >
                  <MenuItem value="" disabled>
                    <em>Masa seçin...</em>
                  </MenuItem>
                  {Array.from({ length: 50 }, (_, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      Masa {index + 1}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={() => setShowTableSelection(false)}
              variant="outlined"
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              İptal
            </Button>
            <Button
              onClick={async () => {
                if (selectedTableNumber) {
                  console.log('🔄 Masa siparişi kaydediliyor...', { 
                    tableNumber: selectedTableNumber, 
                    itemsCount: cart.items.length, 
                    total: cart.total 
                  });
                  
                  // Veri doğrulama
                   if (!cart.items || cart.items.length === 0) {
                     console.error('❌ Sepet boş, masa siparişi kaydedilemez');
                     showToast('Sepet boş! Önce ürün ekleyin.', 'warning');
                    return;
                  }

                   if (!selectedTableNumber || selectedTableNumber <= 0) {
                     console.error('❌ Geçersiz masa numarası:', selectedTableNumber);
                     showToast('Geçersiz masa numarası!', 'error');
                    return;
                  }

                   if (cart.total <= 0) {
                     console.error('❌ Geçersiz toplam tutar:', cart.total);
                     showToast('Geçersiz toplam tutar!', 'error');
                    return;
                  }

                  // Items yapısını kontrol et
                  for (const item of cart.items) {
                     if (!item.product || !item.product.id || !item.product.name || !item.product.price || !item.product.category) {
                       console.error('❌ Geçersiz item yapısı:', item);
                       showToast('Sepette geçersiz ürün var! Sepeti temizleyip deneyin.', 'error');
                      return;
                    }
                  }

                  try {
                    const db = getDatabaseIPC();
                    console.log('📞 Database IPC servisi çağrılıyor...');
                    
                    // Retry mekanizması ile işlemi dene
                    let success = false;
                    let retryCount = 0;
                    const maxRetries = 3;
                    
                    while (!success && retryCount < maxRetries) {
                      try {
                        // Timeout ile işlemi sınırla
                        const timeoutPromise = new Promise((_, reject) => {
                          setTimeout(() => reject(new Error('İşlem zaman aşımına uğradı')), 10000);
                        });
                        
                        const savePromise = db.saveTableOrder(selectedTableNumber, cart.items, cart.total);
                        success = await Promise.race([savePromise, timeoutPromise]) as boolean;
                        
                        if (success) {
                          console.log('✅ Masa siparişi başarıyla kaydedildi');
                          break;
                        } else {
                          console.warn(`⚠️ Deneme ${retryCount + 1} başarısız, tekrar deneniyor...`);
                          retryCount++;
                          if (retryCount < maxRetries) {
                            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
                          }
                        }
                      } catch (error: any) {
                        console.error(`❌ Deneme ${retryCount + 1} hatası:`, error);
                        retryCount++;
                        if (retryCount < maxRetries) {
                          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 saniye bekle
                        } else {
                          throw error;
                        }
                      }
                    }
                    
                    console.log('📞 Database IPC servisi yanıtı:', success);
                    
                    if (success) {
                      // State'i güncelle
                      setTableOrders(prev => ({
                        ...prev,
                        [selectedTableNumber]: {
                          items: cart.items,
                          total: cart.total,
                          startTime: new Date()
                        }
                      }));
                      // Sepeti temizle
                      clearCart();
                      // Dialog'u kapat
                      setShowTableSelection(false);
                      setSelectedTableNumber(null);
                      // Modern toast
                      showToast(`Masa ${selectedTableNumber} için sipariş kaydedildi`, 'success');
                    } else {
                      console.error('❌ Masa siparişi kaydedilemedi - tüm denemeler başarısız');
                      showToast('Masa siparişi kaydedilemedi! Tekrar deneyin.', 'error');
                    }
                  } catch (error: any) {
                    console.error('❌ Masa siparişi kaydetme hatası:', error);
                    console.error('❌ Hata detayı:', error.message);
                    
                    let errorMessage = 'Bilinmeyen hata';
                    if (error.message) {
                      if (error.message.includes('timeout')) {
                        errorMessage = 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.';
                      } else if (error.message.includes('network')) {
                        errorMessage = 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.';
                      } else if (error.message.includes('database')) {
                        errorMessage = 'Veritabanı hatası. Lütfen uygulamayı yeniden başlatın.';
                      } else {
                        errorMessage = error.message;
                      }
                    }
                    
                    showToast(`Hata: ${errorMessage}`, 'error');
                  }
                }
              }}
              variant="contained"
              disabled={!selectedTableNumber}
              sx={{ 
                px: 4, 
                py: 1.5, 
                borderRadius: 2,
                background: selectedTableNumber 
                  ? 'linear-gradient(135deg, #0a4940 30%, #2e6b63 90%)'
                  : 'linear-gradient(45deg, #ccc 30%, #ddd 90%)',
                '&:hover': {
                  background: selectedTableNumber 
                    ? 'linear-gradient(135deg, #053429 30%, #0a4940 90%)'
                    : 'linear-gradient(45deg, #ccc 30%, #ddd 90%)',
                }
              }}
            >
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>

        {/* Masa Detay Dialog */}
        <Dialog
          open={showTableDetail}
          onClose={() => setShowTableDetail(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)',
            color: 'white',
            textAlign: 'center',
            fontWeight: 700
          }}>
            🪑 Masa {selectedTableForDetail} Detayları
          </DialogTitle>
          
          <DialogContent sx={{ p: 4 }}>
            {selectedTableForDetail && (() => {
              const tableOrder = tableOrders[selectedTableForDetail];
              const isOccupied = !!tableOrder;
              
              if (!isOccupied) {
                return (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Box
                      component="img"
                      src={require('./assets/Table.png')}
                      alt="Masa"
                      sx={{
                        width: '80px',
                        height: '80px',
                        mb: 2,
                        opacity: 0.6,
                        filter: 'drop-shadow(0 2px 4px rgba(10, 73, 64, 0.2))'
                      }}
                    />
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                      Bu Masa Boş
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      Masa {selectedTableForDetail} şu anda boş durumda.
                    </Typography>
                  </Box>
                );
              }
              
              // Masa dolu ise
              const ms = currentTime.getTime() - tableOrder.startTime.getTime();
              const totalSeconds = Math.max(0, Math.floor(ms / 1000));
              const hours = Math.floor(totalSeconds / 3600);
              const minutes = Math.floor((totalSeconds % 3600) / 60);
              const seconds = totalSeconds % 60;
              const pad = (n: number) => String(n).padStart(2, '0');
              
              return (
                <Box>
                  {/* Masa Bilgileri */}
                  <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                      📊 Masa Bilgileri
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Toplam Tutar:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {formatPrice(tableOrder.total)}
                      </Typography>
                    </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                         Aktif Süre:
                      </Typography>
                       <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                         {pad(hours)}:{pad(minutes)}:{pad(seconds)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Sipariş Listesi */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
                      📋 Sipariş Listesi
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {tableOrder.items.map((item) => (
                        <ListItem key={item.lineId ?? item.product.id} sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {item.product.name}{item.selectedSizeName ? ` (${item.selectedSizeName})` : ''}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {item.quantity} adet
                              </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              {formatPrice((item.unitPrice ?? item.product.price) * item.quantity)}
                            </Typography>
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Box>
              );
            })()}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={() => setShowTableDetail(false)}
              variant="outlined"
              sx={{ px: 4, py: 1.5, borderRadius: 2 }}
            >
              Kapat
            </Button>
            
            {selectedTableForDetail && tableOrders[selectedTableForDetail] && (
              <>
                <Button
                  onClick={async () => {
                    try {
                      console.log('🔄 Masa ödemesi alınıyor...', { tableNumber: selectedTableForDetail, total: tableOrders[selectedTableForDetail].total });
                      
                      const db = getDatabaseIPC();
                      const tableOrder = tableOrders[selectedTableForDetail];
                      
                      // Satış verisi oluştur
                      const now = new Date();
                      const saleData = {
                        id: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        date: now.toISOString().split('T')[0], // YYYY-MM-DD
                        time: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                        totalAmount: tableOrder.total,
                        paymentMethod: 'cash' as const,
                        cashAmount: tableOrder.total,
                        cardAmount: 0,
                        customerCount: 1,
                        notes: `Masa ${selectedTableForDetail} ödemesi`,
                        createdAt: now.toISOString(),
                        items: tableOrder.items.map((item: any) => ({
                          productId: item.product.id,
                          productName: item.product.name + (item.selectedSizeName ? ` (${item.selectedSizeName})` : ''),
                          quantity: item.quantity,
                          unitPrice: item.unitPrice ?? item.product.price,
                          totalPrice: (item.unitPrice ?? item.product.price) * item.quantity,
                          category: item.product.category
                        }))
                      };
                      
                      console.log('📊 Satış verisi oluşturuldu:', saleData);
                      
                      // Satışı kaydet
                      const saleSuccess = await db.saveSale(saleData);
                      
                      if (saleSuccess) {
                        console.log('✅ Satış başarıyla kaydedildi');
                        
                        // Masayı kapat
                        const closeSuccess = await db.closeTableOrder(selectedTableForDetail);
                        
                        if (closeSuccess) {
                          console.log('✅ Masa başarıyla kapatıldı');
                          
                          // State'den masayı kaldır
                          setTableOrders(prev => {
                            const newOrders = { ...prev };
                            delete newOrders[selectedTableForDetail];
                            return newOrders;
                          });
                          
                          // Ödeme dialogunu aç
                          startPayment(tableOrder.total);
                          setShowTableDetail(false);
                        } else {
                          console.error('❌ Masa kapatılamadı');
                        }
                      } else {
                        console.error('❌ Satış kaydedilemedi');
                      }
                    } catch (error: any) {
                      console.error('❌ Masa ödeme hatası:', error);
                    }
                  }}
                  variant="contained"
                  startIcon={<PaymentIcon />}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #0a4940 30%, #2e6b63 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #053429 30%, #0a4940 100%)',
                    }
                  }}
                >
                  Ödeme Al
                </Button>
                
                <Button
                  onClick={() => {
                    setIsAddingToTable(selectedTableForDetail);
                    setShowTableDetail(false);
                    setShowTables(false); // Ürünler görünümüne geç
                  }}
                  variant="contained"
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 30%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a67d8 30%, #6b46c1 100%)',
                    }
                  }}
                >
                  Sipariş Ekle
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Tam Ekran Toggle Butonu - Sağ Alt Köşe */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
        >
          <IconButton
            onClick={toggleFullscreen}
            size="large"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              width: 60,
              height: 60,
              boxShadow: '0 4px 20px rgba(10, 73, 64, 0.3)',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 25px rgba(10, 73, 64, 0.4)',
              },
              transition: 'all 0.3s ease',
              border: '3px solid white',
            }}
            title={isFullscreen ? 'Tam Ekrandan Çık (Alt+F11)' : 'Tam Ekran Yap (Alt+F11)'}
          >
            {isFullscreen ? (
              <FullscreenExitIcon sx={{ fontSize: '2rem' }} />
            ) : (
              <FullscreenIcon sx={{ fontSize: '2rem' }} />
            )}
          </IconButton>
        </Box>
      {/* Modern toast bildirimleri */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={2200}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={SlideLeft}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity={toastSeverity}
          variant="filled"
          sx={{
            borderRadius: 2,
            boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
            background: toastSeverity === 'success' ? 'linear-gradient(135deg, #0a4940 0%, #2e6b63 100%)' : undefined,
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' }
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
      </Box>
    );
  };

const App: React.FC = () => {
  const { isAuthenticated, showSplashScreen } = useStore();

  // Electron body reset
  React.useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!isAuthenticated && !showSplashScreen && <LoginScreen />}
      {!isAuthenticated && showSplashScreen && <SplashScreen />}
      {isAuthenticated && <MainApp />}
    </ThemeProvider>
  );
};

export default App; 