import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Tab,
  Tabs,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button
} from '@mui/material';
import {
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon,
  LocalAtm as LocalAtmIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as AccountBalanceIcon,
  ShoppingCart as ShoppingCartIcon,
  Category as CategoryIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { getDatabaseIPC } from '../services/database-ipc';
import { Sale, DashboardStats } from '../types';
import { createTestSales } from '../services/test-sales';

interface AdminDashboardProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ open, onClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    if (open) {
      loadData();
      
      // Canlı saat
      const updateTime = () => {
        const now = new Date();
        setCurrentTime(`${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR')}`);
      };
      
      updateTime();
      const timer = setInterval(updateTime, 1000);
      
      return () => clearInterval(timer);
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const db = getDatabaseIPC();
      const [salesData, statsData] = await Promise.all([
        db.getAllSales(),
        db.getDashboardStats()
      ]);
      setSales(salesData);
      setStats(statsData);
      
      // Son güncelleme zamanını kaydet
      const now = new Date();
      setLastUpdateTime(`${now.toLocaleDateString('tr-TR')} ${now.toLocaleTimeString('tr-TR')}`);
      
    } catch (error) {
      console.error('Admin dashboard veri yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestData = async () => {
    setLoading(true);
    try {
      await createTestSales();
      await loadData(); // Verileri yeniden yükle
    } catch (error) {
      console.error('Test verisi oluşturma hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  const formatDateTime = (dateStr: string, timeStr: string) => {
    const date = new Date(`${dateStr}T${timeStr}:00`);
    return `${date.toLocaleDateString('tr-TR')} ${timeStr}`;
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash': return 'success';
      case 'card': return 'primary';
      case 'mixed': return 'warning';
      default: return 'default';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash': return 'Nakit';
      case 'card': return 'Kart';
      case 'mixed': return 'Karma';
      default: return method;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: { 
          height: '90vh',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: '#667eea' }}>
            <AnalyticsIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Satış raporları ve istatistikler
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {currentTime && (
                <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                  🕐 Canlı Saat: {currentTime}
                </Typography>
              )}
              {lastUpdateTime && (
                <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic' }}>
                  Son güncelleme: {lastUpdateTime}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            onClick={handleCreateTestData}
            variant="outlined"
            size="small"
            disabled={loading}
            sx={{ fontSize: '0.75rem' }}
          >
            Test Verisi
          </Button>
          <Button
            onClick={loadData}
            variant="contained"
            size="small"
            disabled={loading}
            sx={{ fontSize: '0.75rem' }}
          >
            Yenile
          </Button>
          <IconButton onClick={onClose} sx={{ color: '#666' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ 
        p: 0, 
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)'
      }}>
        {loading && <LinearProgress />}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab 
              label="Genel Bakış" 
              icon={<TrendingUpIcon />} 
              sx={{ fontWeight: 600 }}
            />
            <Tab 
              label="Satış Detayları" 
              icon={<ReceiptIcon />}
              sx={{ fontWeight: 600 }}
            />
            <Tab 
              label="İstatistikler" 
              icon={<TimelineIcon />}
              sx={{ fontWeight: 600 }}
            />
          </Tabs>
        </Box>

        {/* Genel Bakış */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            {stats && (
              <Box>
                {/* Hızlı İstatistikler */}
                <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: '250px' }}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: 3
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                              {stats.todaySales.count}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Bugünkü Satış
                            </Typography>
                          </Box>
                          <ReceiptIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: '250px' }}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      borderRadius: 3
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                              {formatPrice(stats.todaySales.totalAmount)}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Bugünkü Ciro
                            </Typography>
                          </Box>
                          <AttachMoneyIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: '250px' }}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                      borderRadius: 3
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                              {stats.weeklySales.count}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Haftalık Satış
                            </Typography>
                          </Box>
                          <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: '250px' }}>
                    <Card sx={{ 
                      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      color: 'white',
                      borderRadius: 3
                    }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                              {formatPrice(stats.monthlySales.totalAmount)}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                              Aylık Ciro
                            </Typography>
                          </Box>
                          <ScheduleIcon sx={{ fontSize: 40, opacity: 0.7 }} />
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                {/* Ödeme Yöntemleri */}
                <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: '250px' }}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocalAtmIcon color="success" />
                          Nakit Satışlar
                        </Typography>
                        <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                          {stats.paymentMethodStats.cash.count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatPrice(stats.paymentMethodStats.cash.amount)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: '250px' }}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CreditCardIcon color="primary" />
                          Kart Satışları
                        </Typography>
                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
                          {stats.paymentMethodStats.card.count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatPrice(stats.paymentMethodStats.card.amount)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: '250px' }}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalanceIcon color="warning" />
                          Karma Satışlar
                        </Typography>
                        <Typography variant="h4" sx={{ color: 'warning.main', fontWeight: 700 }}>
                          {stats.paymentMethodStats.mixed.count}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatPrice(stats.paymentMethodStats.mixed.amount)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                {/* En Çok Satılan Ürünler ve Kategoriler */}
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: '400px' }}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ShoppingCartIcon color="primary" />
                          En Çok Satılan Ürünler
                        </Typography>
                        <List>
                          {stats.topProducts.slice(0, 5).map((product, index) => (
                            <ListItem key={index}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: `hsl(${index * 60}, 70%, 50%)` }}>
                                  {index + 1}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={product.productName}
                                secondary={`${product.quantity} adet - ${formatPrice(product.totalSales)}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: '400px' }}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CategoryIcon color="secondary" />
                          En Çok Satılan Kategoriler
                        </Typography>
                        <List>
                          {stats.topCategories.map((category, index) => (
                            <ListItem key={index}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: `hsl(${index * 90}, 60%, 60%)` }}>
                                  {index + 1}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={category.categoryName}
                                secondary={`${category.quantity} adet - ${formatPrice(category.totalSales)}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>

        {/* Satış Detayları */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptIcon />
              Satış Geçmişi ({sales.length} satış)
            </Typography>
            
            <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Saat</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ürünler</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tutar</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ödeme</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Detay</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sales.slice(0, 50).map((sale) => (
                    <TableRow key={sale.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatDate(sale.date)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(sale.createdAt).toLocaleDateString('tr-TR') === new Date().toLocaleDateString('tr-TR') ? 'Bugün' : 
                           new Date(sale.createdAt).toLocaleDateString('tr-TR') === new Date(Date.now() - 24*60*60*1000).toLocaleDateString('tr-TR') ? 'Dün' : 
                           formatDate(sale.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {sale.time}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Gerçek Saat
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {sale.items.map(item => `${item.productName} (${item.quantity})`).join(', ')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {formatPrice(sale.totalAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getPaymentMethodText(sale.paymentMethod)}
                          color={getPaymentMethodColor(sale.paymentMethod) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {sale.paymentMethod === 'mixed' && (
                          <Typography variant="caption">
                            Nakit: {formatPrice(sale.cashAmount || 0)}<br/>
                            Kart: {formatPrice(sale.cardAmount || 0)}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* İstatistikler */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            {stats && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimelineIcon />
                  Saatlik Satış Analizi
                </Typography>
                
                <Card sx={{ borderRadius: 3, mb: 4 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {Array.from({ length: 24 }, (_, hour) => {
                        const hourData = stats.hourlyStats.find(h => h.hour === hour);
                        const sales = hourData?.sales || 0;
                        const amount = hourData?.amount || 0;
                        const maxSales = Math.max(...stats.hourlyStats.map(h => h.sales), 1);
                        const percentage = (sales / maxSales) * 100;
                        
                        return (
                          <Box key={hour} sx={{ minWidth: '80px', textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {hour.toString().padStart(2, '0')}:00
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={percentage}
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                bgcolor: '#f0f0f0',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: sales > 0 ? '#4caf50' : '#e0e0e0'
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                              {sales}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatPrice(amount)}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>

                {/* Detaylı İstatistikler */}
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: 1, minWidth: '300px' }}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Bugünkü Satış Dağılımı
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Nakit Satış:</Typography>
                          <Typography sx={{ fontWeight: 600 }}>{stats.todaySales.cashSales}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Kart Satış:</Typography>
                          <Typography sx={{ fontWeight: 600 }}>{stats.todaySales.cardSales}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Karma Satış:</Typography>
                          <Typography sx={{ fontWeight: 600 }}>{stats.todaySales.mixedSales}</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ fontWeight: 700 }}>Toplam:</Typography>
                          <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {stats.todaySales.count}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: 1, minWidth: '300px' }}>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Periyodik Karşılaştırma
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Bugün:</Typography>
                          <Typography sx={{ fontWeight: 600 }}>
                            {formatPrice(stats.todaySales.totalAmount)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Bu Hafta:</Typography>
                          <Typography sx={{ fontWeight: 600 }}>
                            {formatPrice(stats.weeklySales.totalAmount)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography>Bu Ay:</Typography>
                          <Typography sx={{ fontWeight: 600 }}>
                            {formatPrice(stats.monthlySales.totalAmount)}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>Günlük Ortalama:</Typography>
                          <Typography sx={{ fontWeight: 600, color: 'success.main' }}>
                            {formatPrice(stats.monthlySales.totalAmount / 30)}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </TabPanel>
      </DialogContent>
    </Dialog>
  );
};

export default AdminDashboard; 