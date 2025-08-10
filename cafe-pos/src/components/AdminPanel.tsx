import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Snackbar,
  Grid
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Category as CategoryIcon,
  Restaurant as RestaurantIcon
} from '@mui/icons-material';
import { Category, Product } from '../types';
import { useStore } from '../store/useStore';

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ open, onClose }) => {
  const { 
    categories, 
    products, 
    addProduct, 
    removeProduct, 
    updateProduct,
    changePassword,
    checkCurrentPassword 
  } = useStore();
  
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Ürün Ekleme State'leri
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    image: ''
  });

  // Dosya yükleme state'i
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  


  // Parola Değiştirme State'leri
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Ürün Listesi State'leri
  const [selectedCategoryForList, setSelectedCategoryForList] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{id: string, name: string} | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Dosya seçme ve otomatik resize
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Otomatik resize için görsel yükle
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resizeImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Otomatik görsel boyutlandırma
  const resizeImage = (imageSrc: string) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Hedef boyutlar
      const targetWidth = 300;
      const targetHeight = 200;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Görseli merkeze yerleştir ve kırp
      const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      const x = (targetWidth - scaledWidth) / 2;
      const y = (targetHeight - scaledHeight) / 2;

      ctx?.drawImage(img, x, y, scaledWidth, scaledHeight);

      const resizedImage = canvas.toDataURL('image/jpeg', 0.8);
      setImagePreview(resizedImage);
      setNewProduct({ ...newProduct, image: resizedImage });
    };

    img.src = imageSrc;
  };



  // Görsel temizleme
  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setNewProduct({ ...newProduct, image: '' });
  };

  // Ürün Ekleme
  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      showSnackbar('Lütfen tüm alanları doldurun!', 'error');
      return;
    }

    const price = parseFloat(newProduct.price);
    if (isNaN(price) || price <= 0) {
      showSnackbar('Geçerli bir fiyat girin!', 'error');
      return;
    }

    const product: Product = {
      id: `p${Date.now()}`,
      name: newProduct.name,
      price: price,
      category: newProduct.category,
      image: newProduct.image
    };

    addProduct(product);
    setNewProduct({ name: '', price: '', category: '', image: '' });
    clearImage();
    showSnackbar('Ürün başarıyla eklendi!');
  };

  // Ürün Silme - Modern Dialog
  const handleDeleteProduct = (productId: string, productName: string) => {
    setProductToDelete({ id: productId, name: productName });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      removeProduct(productToDelete.id);
      showSnackbar('Ürün başarıyla silindi!');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  // Parola Değiştirme
  const handleChangePassword = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showSnackbar('Lütfen tüm alanları doldurun!', 'error');
      return;
    }

    if (!checkCurrentPassword(passwordForm.currentPassword)) {
      showSnackbar('Mevcut parola yanlış!', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showSnackbar('Yeni parolalar eşleşmiyor!', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      showSnackbar('Yeni parola en az 4 karakter olmalıdır!', 'error');
      return;
    }

    changePassword(passwordForm.newPassword);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showSnackbar('Parola başarıyla değiştirildi!');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: '900px',
            height: '700px',
            maxWidth: 'none',
            maxHeight: 'none',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          bgcolor: 'primary.main', 
          color: 'white',
          py: 3 
        }}>
          <SettingsIcon sx={{ fontSize: '2rem' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Admin Paneli
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab 
                icon={<RestaurantIcon />} 
                label="Ürün Yönetimi" 
                iconPosition="start"
                sx={{ minHeight: 72 }}
              />
              <Tab 
                icon={<SecurityIcon />} 
                label="Parola Değiştir" 
                iconPosition="start"
                sx={{ minHeight: 72 }}
              />
            </Tabs>
          </Box>

          {/* Ürün Yönetimi Sekmesi */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {/* Ürün Ekleme */}
              <Box sx={{ flex: 1, minWidth: '400px' }}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AddIcon /> Yeni Ürün Ekle
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                      <TextField
                        label="Ürün Adı"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        fullWidth
                        variant="outlined"
                      />
                      
                      <TextField
                        label="Fiyat (₺)"
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        fullWidth
                        variant="outlined"
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                      
                      {/* Görsel Yükleme Alanı */}
                      <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
                        {imagePreview ? (
                          <Box sx={{ position: 'relative' }}>
                            <Box
                              component="img"
                              src={imagePreview}
                              alt="Preview"
                              sx={{
                                width: '100%',
                                maxHeight: 150,
                                objectFit: 'cover',
                                borderRadius: 2,
                                mb: 2
                              }}
                            />
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={clearImage}
                              sx={{ mt: 1 }}
                            >
                              Görseli Kaldır
                            </Button>
                          </Box>
                        ) : (
                          <Box>
                            <Typography sx={{ fontSize: '3rem', mb: 2 }}>📸</Typography>
                            <Typography variant="h6" gutterBottom>
                              Ürün Görseli Ekle
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              JPG, PNG veya WEBP formatında görsel seçin
                            </Typography>
                            <Button
                              variant="contained"
                              component="label"
                              sx={{ mt: 2 }}
                            >
                              Dosya Seç
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleFileSelect}
                              />
                            </Button>
                          </Box>
                        )}
                      </Box>
                      
                      <FormControl fullWidth>
                        <InputLabel>Kategori</InputLabel>
                        <Select
                          value={newProduct.category}
                          label="Kategori"
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category.id} value={category.id}>
                              {category.icon} {category.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddProduct}
                        sx={{ mt: 1 }}
                      >
                        Ürün Ekle
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Mevcut Ürünler */}
              <Box sx={{ flex: 1, minWidth: '400px' }}>
                <Card sx={{ borderRadius: 3, maxHeight: '500px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CategoryIcon /> Ürün Listesi
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                      <InputLabel>Kategori Seçin</InputLabel>
                      <Select
                        value={selectedCategoryForList}
                        label="Kategori Seçin"
                        onChange={(e) => setSelectedCategoryForList(e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Tüm Kategoriler ({products.length} ürün)</em>
                        </MenuItem>
                        {categories.map((category) => {
                          const count = products.filter(p => p.category === category.id).length;
                          return (
                            <MenuItem key={category.id} value={category.id}>
                              {category.icon} {category.name} ({count})
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </CardContent>
                  
                  <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 2 }}>
                    <List>
                      {(() => {
                        const filteredProducts = selectedCategoryForList 
                          ? products.filter(p => p.category === selectedCategoryForList)
                          : products;
                        
                        if (filteredProducts.length === 0) {
                          return (
                            <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                              <Typography>Bu kategoride ürün bulunmuyor</Typography>
                            </Box>
                          );
                        }
                        
                        return filteredProducts.map((product) => (
                          <ListItem key={product.id} divider sx={{ alignItems: 'flex-start' }}>
                            <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'center' }}>
                              {product.image && (
                                <Box
                                  component="img"
                                  src={product.image}
                                  alt={product.name}
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 2,
                                    objectFit: 'cover',
                                    flexShrink: 0
                                  }}
                                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <ListItemText
                                primary={product.name}
                                secondary={
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatPrice(product.price)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {categories.find(c => c.id === product.category)?.name}
                                    </Typography>
                                  </Box>
                                }
                              />
                              <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                color="error"
                                size="small"
                                sx={{ 
                                  bgcolor: 'error.light', 
                                  color: 'white',
                                  '&:hover': { bgcolor: 'error.main' }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </ListItem>
                        ));
                      })()}
                    </List>
                  </Box>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          {/* Parola Değiştirme Sekmesi */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ maxWidth: 400, mx: 'auto' }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon /> Parola Değiştir
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                    <TextField
                      label="Mevcut Parola"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      fullWidth
                      variant="outlined"
                    />
                    
                    <TextField
                      label="Yeni Parola"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      fullWidth
                      variant="outlined"
                      helperText="En az 4 karakter olmalıdır"
                    />
                    
                    <TextField
                      label="Yeni Parola (Tekrar)"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      fullWidth
                      variant="outlined"
                    />
                    
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleChangePassword}
                      sx={{ mt: 2 }}
                    >
                      Parolayı Değiştir
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </TabPanel>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={onClose} 
            startIcon={<CancelIcon />}
            variant="outlined"
            size="large"
          >
            Kapat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modern Silme Onay Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDelete}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{ 
            bgcolor: 'error.light', 
            borderRadius: '50%', 
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DeleteIcon sx={{ fontSize: '3rem', color: 'error.dark' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Ürünü Sil
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
            "{productToDelete?.name}" ürününü silmek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Bu işlem geri alınamaz. Ürün kalıcı olarak silinecektir.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2, justifyContent: 'center' }}>
          <Button 
            onClick={cancelDelete}
            variant="outlined"
            size="large"
            sx={{ 
              px: 4,
              borderRadius: 3,
              borderColor: 'grey.400',
              color: 'grey.600',
              '&:hover': {
                borderColor: 'grey.600',
                bgcolor: 'grey.50'
              }
            }}
          >
            İptal
          </Button>
          
          <Button 
            onClick={confirmDelete}
            variant="contained"
            color="error"
            size="large"
            sx={{ 
              px: 4,
              borderRadius: 3,
              background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #b71c1c 30%, #d32f2f 90%)',
              }
            }}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>



      {/* Bildirim Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AdminPanel; 