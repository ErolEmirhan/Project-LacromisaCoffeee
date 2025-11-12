import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  TextField,
  Chip
} from '@mui/material';
import { 
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalanceWallet as CashIcon,
  Contactless as ContactlessIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  AccountBalance as MixedPaymentIcon,
  ShoppingCart as CartIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useStore } from '../store/useStore';
import soundEffects from '../services/soundEffects';

const PaymentDialog: React.FC = () => {
  const { 
    showPaymentDialog, 
    paymentStatus, 
    paymentAmount, 
    paymentMode,
    splitItemsPayment,
    mixedPayment,
    hidePaymentDialog, 
    completePayment,
    cancelPayment,
    setPaymentMode,
    markItemAsPaid,
    setMixedPaymentAmounts,
    cart,
    showReceiptPreviewDialog,
    saveSale
  } = useStore();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState<'method' | 'details' | 'processing' | 'item-payment' | 'customer-selection'>('method');
  const [cashAmount, setCashAmount] = React.useState<string>('');
  const [cardAmount, setCardAmount] = React.useState<string>('');
  const [processingItemId, setProcessingItemId] = React.useState<string>('');
  const [allItemsPaid, setAllItemsPaid] = React.useState(false);
  const [currentItemForPayment, setCurrentItemForPayment] = React.useState<{id: string, name: string, amount: number} | null>(null);
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState<any>(null);
  const [showCustomerSelection, setShowCustomerSelection] = React.useState(false);

  const paymentMethods = [
    { id: 'cash', name: 'Nakit', icon: CashIcon, color: '#e91e63', description: 'Nakit ödeme' },
    { id: 'card', name: 'Kredi Kartı', icon: CreditCardIcon, color: '#2196f3', description: 'Kart ile ödeme' },
    { id: 'contactless', name: 'Temassız', icon: ContactlessIcon, color: '#ff9800', description: 'NFC/Temassız ödeme' }
  ];

  const allPaymentMethods = [
    ...paymentMethods,
    { id: 'split-items', name: 'Ayrı Hesap', icon: CartIcon, color: '#9c27b0', description: 'Her ürünü ayrı öde' },
    { id: 'mixed', name: 'Karma Ödeme', icon: MixedPaymentIcon, color: '#ff5722', description: 'Nakit + Kart karışık' },
    { id: 'customer-special', name: 'Müşteri Özel', icon: ContactlessIcon, color: '#e91e63', description: 'Müşteriye özel sipariş' }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  // Müşterileri yükle
  const loadCustomers = React.useCallback(async () => {
    try {
      const { getDatabaseIPC } = await import('../services/database-ipc');
      const db = getDatabaseIPC();
      const customerList = await db.getCustomers();
      setCustomers(customerList);
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
      setCustomers([]);
    }
  }, []);

  // Müşteriye özel siparişi kaydet
  const handleCustomerSpecialOrder = async (customer: any) => {
    try {
      setIsProcessing(true);
      
      // Müşteriye özel siparişi veritabanına kaydet
      const { getDatabaseIPC } = await import('../services/database-ipc');
      const db = getDatabaseIPC();
      
      // Müşteriye özel siparişi veritabanına kaydet
      const success = await db.addCustomerOrder(
        customer.id, 
        cart.items, 
        paymentAmount, 
        'Müşteri Özel'
      );
      
      if (success) {
        // Başarılı mesajı göster
        const receiptData = {
          items: cart.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            total: item.product.price * item.quantity
          })),
          totalAmount: paymentAmount,
          paymentMethod: 'Müşteri Özel',
          customerName: customer.name,
          customerPhone: customer.phone
        };
        
        showReceiptPreviewDialog(receiptData);
        soundEffects.playPaymentSuccess(); // Ödeme başarılı sesi
        completePayment();
        setCurrentStep('method');
        setSelectedPaymentMethod('');
        setSelectedCustomer(null);
      } else {
        console.error('❌ Müşteri siparişi kaydedilemedi');
      }
      
    } catch (error) {
      console.error('Müşteri özel sipariş hatası:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Müşterileri yükle - koşullu olarak
  React.useEffect(() => {
    if (currentStep === 'customer-selection') {
      loadCustomers();
    }
  }, [currentStep, loadCustomers]);

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    
    if (methodId === 'split-items' || methodId === 'mixed') {
      setPaymentMode(methodId as 'split-items' | 'mixed');
      setCurrentStep('details');
    } else if (methodId === 'customer-special') {
      setPaymentMode('customer-special');
      setCurrentStep('customer-selection');
    } else {
      setPaymentMode('normal');
      handleSimplePayment(methodId);
    }
  };

  const handleItemPaymentMethodSelect = (methodId: string) => {
    if (currentItemForPayment) {
      setSelectedPaymentMethod(methodId);
      handleSingleItemPayment(currentItemForPayment.id, currentItemForPayment.amount, methodId);
    }
  };

  const handleSimplePayment = (method: string) => {
    setIsProcessing(true);
    setCurrentStep('processing');
    
    setTimeout(async () => {
      const receiptData = {
        items: cart.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          total: item.product.price * item.quantity
        })),
        totalAmount: paymentAmount,
        paymentMethod: allPaymentMethods.find(pm => pm.id === method)?.name || method
      };
      
      // Satışı veritabanına kaydet - yeni sistem
      const paymentMethodForDB = method === 'contactless' ? 'card' : method;
      if (paymentMethodForDB === 'mixed') {
        await saveSale('mixed', parseFloat(cashAmount), parseFloat(cardAmount));
      } else {
        await saveSale(paymentMethodForDB as 'cash' | 'card');
      }

      showReceiptPreviewDialog(receiptData);
      soundEffects.playPaymentSuccess(); // Ödeme başarılı sesi
      completePayment();
      setIsProcessing(false);
      setCurrentStep('method');
      setSelectedPaymentMethod('');
    }, 2500);
  };

  const handleCancel = () => {
    cancelPayment();
    setCurrentStep('method');
    setSelectedPaymentMethod('');
    setCashAmount('');
    setCardAmount('');
    setCurrentItemForPayment(null);
  };

  const handleBackToMethods = () => {
    setCurrentStep('method');
    setSelectedPaymentMethod('');
    setPaymentMode('normal');
    setCurrentItemForPayment(null);
  };

  const handleBackToSplitItems = () => {
    setCurrentStep('details');
    setSelectedPaymentMethod('');
    setCurrentItemForPayment(null);
  };

  const handleSingleItemPayment = (itemId: string, amount: number, paymentMethod?: string) => {
    if (!paymentMethod) {
      // Ödeme yöntemi seçimi için dialog aç
      const cartItem = cart.items.find(item => item.product.id === itemId);
      if (cartItem) {
        setCurrentItemForPayment({
          id: itemId,
          name: cartItem.product.name,
          amount: amount
        });
        setCurrentStep('item-payment');
      }
      return;
    }

    setProcessingItemId(itemId);
    setCurrentStep('processing');
    
    // Tek ürün ödemesi simülasyonu
    setTimeout(async () => {
      markItemAsPaid(itemId);
      setProcessingItemId('');
      
      // Tüm ürünler ödendiyse tamamla
      const updatedSplitPayment = splitItemsPayment.map(item => 
        item.itemId === itemId ? { ...item, paid: true } : item
      );
      
      if (updatedSplitPayment.every(item => item.paid)) {
        setAllItemsPaid(true);
        setTimeout(async () => {
          const receiptData = {
            items: cart.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
              total: item.product.price * item.quantity
            })),
            totalAmount: paymentAmount,
            paymentMethod: 'Ayrı Hesap'
          };
          
          // Satışı veritabanına kaydet - ayrı hesap ödemelerinde karışık kaydet
          await saveSale('mixed');

          showReceiptPreviewDialog(receiptData);
          completePayment();
          setCurrentStep('method');
          setSelectedPaymentMethod('');
          setAllItemsPaid(false);
          setCurrentItemForPayment(null);
        }, 2000);
      } else {
        // Diğer ürünlere devam et
        setCurrentStep('details');
        setCurrentItemForPayment(null);
        setSelectedPaymentMethod('');
      }
    }, 2500);
  };

  const completeSplitPayment = () => {
    const allPaid = splitItemsPayment.every(item => item.paid);
    if (allPaid) {
      handleSimplePayment('split-items');
    }
  };

  const completeMixedPayment = () => {
    const cash = parseFloat(cashAmount) || 0;
    const card = parseFloat(cardAmount) || 0;
    
    if (Math.abs((cash + card) - paymentAmount) < 0.01) {
      setMixedPaymentAmounts(cash, card);
      handleSimplePayment('mixed');
    }
  };

  const getPaidItemsTotal = () => {
    return cart.items
      .filter(cartItem => splitItemsPayment.find(sp => sp.itemId === cartItem.product.id)?.paid)
      .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const getRemainingAmount = () => {
    return paymentAmount - getPaidItemsTotal();
  };

  // Method Selection Screen
  if (currentStep === 'method') {
    return (
      <Dialog
        open={showPaymentDialog}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
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
          gap: 1
        }}>
          <Box sx={{ 
            bgcolor: 'primary.light', 
            borderRadius: '50%', 
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PaymentIcon sx={{ fontSize: '2rem', color: 'primary.dark' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Ödeme Yöntemi Seçin
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {formatPrice(paymentAmount)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {cart.items.length} ürün • Toplam tutar
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
            gap: 2 
          }}>
            {allPaymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <Card 
                  key={method.id}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${method.color}40`
                    },
                    border: selectedPaymentMethod === method.id ? 
                      `2px solid ${method.color}` : '2px solid transparent'
                  }}
                  onClick={() => handlePaymentMethodSelect(method.id)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Box sx={{ 
                      bgcolor: `${method.color}20`, 
                      borderRadius: '50%', 
                      p: 2, 
                      display: 'inline-flex',
                      mb: 2
                    }}>
                      <IconComponent sx={{ fontSize: '2rem', color: method.color }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {method.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {method.description}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleCancel} 
            startIcon={<CancelIcon />}
            variant="outlined"
            size="large"
            fullWidth
          >
            İptal
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Item Payment Method Selection Screen (Yeni Ekran)
  if (currentStep === 'item-payment' && currentItemForPayment) {
    return (
      <Dialog
        open={showPaymentDialog}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          pb: 2
        }}>
          <Button
            onClick={handleBackToSplitItems}
            startIcon={<BackIcon />}
            variant="outlined"
            size="small"
          >
            Geri
          </Button>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Ödeme Yöntemi Seçin
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, color: 'primary.main' }}>
              {currentItemForPayment.name}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {formatPrice(currentItemForPayment.amount)}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, 
            gap: 2 
          }}>
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              return (
                <Card 
                  key={method.id}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${method.color}40`
                    },
                    border: selectedPaymentMethod === method.id ? 
                      `2px solid ${method.color}` : '2px solid transparent'
                  }}
                  onClick={() => handleItemPaymentMethodSelect(method.id)}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Box sx={{ 
                      bgcolor: `${method.color}20`, 
                      borderRadius: '50%', 
                      p: 2, 
                      display: 'inline-flex',
                      mb: 2
                    }}>
                      <IconComponent sx={{ fontSize: '2rem', color: method.color }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {method.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {method.description}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleCancel} 
            startIcon={<CancelIcon />}
            variant="outlined"
            size="large"
            fullWidth
          >
            İptal
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Split Items Payment Screen
  if (currentStep === 'details' && paymentMode === 'split-items') {
    return (
      <Dialog
        open={showPaymentDialog}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            minHeight: '500px'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          pb: 2
        }}>
          <Button
            onClick={handleBackToMethods}
            startIcon={<BackIcon />}
            variant="outlined"
            size="small"
          >
            Geri
          </Button>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Ayrı Hesap Ödemesi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Her ürünü tek tek ödeyin
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {allItemsPaid ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CheckIcon sx={{ fontSize: '4rem', color: 'success.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main', mb: 2 }}>
                Ödeme Tamamlandı!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Tüm ürünlerin ödemeleri başarıyla alındı. Fiş hazırlanıyor...
              </Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Ödenmiş</Typography>
                    <Typography variant="h6" color="success.main">
                      {formatPrice(getPaidItemsTotal())}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Kalan</Typography>
                    <Typography variant="h6" color="error.main">
                      {formatPrice(getRemainingAmount())}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <List>
                {cart.items.map((cartItem) => {
                  const splitItem = splitItemsPayment.find(sp => sp.itemId === cartItem.product.id);
                  const isPaid = splitItem?.paid || false;
                  const itemTotal = cartItem.product.price * cartItem.quantity;
                  const isProcessing = processingItemId === cartItem.product.id;

                  return (
                    <ListItem 
                      key={cartItem.product.id}
                      sx={{ 
                        border: 1, 
                        borderColor: isPaid ? 'success.main' : 'grey.300',
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: isPaid ? 'success.50' : 'background.paper'
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {cartItem.product.name}
                            </Typography>
                            {isPaid && (
                              <Chip 
                                label="ÖDENDİ" 
                                size="small" 
                                color="success" 
                                variant="filled" 
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {cartItem.quantity} adet × {formatPrice(cartItem.product.price)}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {formatPrice(itemTotal)}
                          </Typography>
                          <Button
                            variant={isPaid ? "outlined" : "contained"}
                            color={isPaid ? "success" : isProcessing ? "warning" : "primary"}
                            size="small"
                            disabled={isPaid || isProcessing || (processingItemId !== '' && !isProcessing)}
                            onClick={() => handleSingleItemPayment(cartItem.product.id, itemTotal)}
                            sx={{ minWidth: '120px' }}
                          >
                            {isPaid ? '✓ ÖDENDİ' : isProcessing ? 'İŞLENİYOR...' : 'ÖDEME AL'}
                          </Button>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCancel} 
            startIcon={<CancelIcon />}
            variant="outlined"
            size="large"
            fullWidth
          >
            İptal
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Mixed Payment Screen
  if (currentStep === 'details' && paymentMode === 'mixed') {
    const cash = parseFloat(cashAmount) || 0;
    const card = parseFloat(cardAmount) || 0;
    const total = cash + card;
    const isValid = Math.abs(total - paymentAmount) < 0.01;
    const difference = paymentAmount - total;

    return (
      <Dialog
        open={showPaymentDialog}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            minHeight: '500px'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          pb: 2
        }}>
          <Button
            onClick={handleBackToMethods}
            startIcon={<BackIcon />}
            variant="outlined"
            size="small"
          >
            Geri
          </Button>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Karma Ödeme
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Nakit + Kart kombinasyonu
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ mb: 3, p: 3, bgcolor: 'primary.50', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Toplam Tutar</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
              {formatPrice(paymentAmount)}
            </Typography>
            {!isValid && (
              <Typography 
                variant="body2" 
                color={difference > 0 ? 'error.main' : 'warning.main'}
                sx={{ fontWeight: 600 }}
              >
                {difference > 0 ? 
                  `Eksik: ${formatPrice(difference)}` : 
                  `Fazla: ${formatPrice(Math.abs(difference))}`
                }
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            <Card sx={{ p: 3, border: 2, borderColor: 'success.main', flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CashIcon sx={{ color: 'success.main', fontSize: '2rem' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Nakit Ödeme
                </Typography>
              </Box>
              <TextField
                label="Nakit Miktar"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                type="number"
                fullWidth
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                helperText={cash > 0 ? formatPrice(cash) : 'Nakit miktarı girin'}
              />
            </Card>
            
            <Card sx={{ p: 3, border: 2, borderColor: 'primary.main', flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CreditCardIcon sx={{ color: 'primary.main', fontSize: '2rem' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Kart Ödeme
                </Typography>
              </Box>
              <TextField
                label="Kart Miktar"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                type="number"
                fullWidth
                variant="outlined"
                inputProps={{ min: 0, step: 0.01 }}
                helperText={card > 0 ? formatPrice(card) : 'Kart miktarı girin'}
              />
            </Card>
          </Box>

          <Box sx={{ mt: 3, p: 2, bgcolor: isValid ? 'success.50' : 'grey.50', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Girilen Toplam</Typography>
                <Typography variant="h6" color={isValid ? 'success.main' : 'text.primary'}>
                  {formatPrice(total)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Durum</Typography>
                <Typography 
                  variant="h6" 
                  color={isValid ? 'success.main' : 'error.main'}
                  sx={{ fontWeight: 600 }}
                >
                  {isValid ? '✓ Eşleşti' : '✗ Eşleşmiyor'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCancel} 
            startIcon={<CancelIcon />}
            variant="outlined"
            size="large"
          >
            İptal
          </Button>
          <Button 
            onClick={completeMixedPayment}
            startIcon={<CheckIcon />}
            variant="contained"
            size="large"
            disabled={!isValid}
            sx={{ flex: 1 }}
          >
            Ödemeyi Tamamla
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Customer Selection Screen
  if (currentStep === 'customer-selection') {
    return (
      <Dialog
        open={showPaymentDialog}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
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
          gap: 1
        }}>
          <Box sx={{ 
            bgcolor: 'primary.light', 
            borderRadius: '50%', 
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ContactlessIcon sx={{ fontSize: '2rem', color: 'primary.dark' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Müşteri Özel Sipariş
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            {formatPrice(paymentAmount)}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          {/* Sipariş Özeti */}
          <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              📋 Sipariş Özeti
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Toplam Tutar</Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                  {formatPrice(paymentAmount)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Ürün Sayısı</Typography>
                <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
                  {cart.items.length} adet
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Tarih & Saat</Typography>
              <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500 }}>
                {new Date().toLocaleDateString('tr-TR')} - {new Date().toLocaleTimeString('tr-TR')}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Ürünler</Typography>
              <Box sx={{ mt: 1 }}>
                {cart.items.map((item, index) => (
                  <Typography key={index} variant="body2" color="text.primary">
                    • {item.product.name} x{item.quantity} - {formatPrice(item.product.price * item.quantity)}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Box>

          {/* Müşteri Seçimi */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              👤 Müşteri Seçin
            </Typography>
            <Box sx={{ 
              maxHeight: 300, 
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1
            }}>
              {customers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Henüz müşteri bulunmuyor
                  </Typography>
                </Box>
              ) : (
                customers.map((customer) => (
                  <Box
                    key={customer.id || `customer-${customer.name}`}
                    onClick={() => setSelectedCustomer(customer)}
                    sx={{
                      p: 2,
                      mb: 1,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: selectedCustomer?.id === customer.id ? 'primary.main' : 'transparent',
                      bgcolor: selectedCustomer?.id === customer.id ? 'primary.50' : 'background.paper',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'grey.50',
                        borderColor: 'primary.light'
                      }
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {customer.name}
                    </Typography>
                    {customer.phone && (
                      <Typography variant="body2" color="text.secondary">
                        📱 {customer.phone}
                      </Typography>
                    )}
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleCancel} 
            startIcon={<CancelIcon />}
            variant="outlined"
            size="large"
          >
            İptal
          </Button>
          <Button 
            onClick={() => {
              if (selectedCustomer) {
                // Müşteriye özel siparişi kaydet
                handleCustomerSpecialOrder(selectedCustomer);
              }
            }}
            startIcon={<CheckIcon />}
            variant="contained"
            size="large"
            disabled={!selectedCustomer}
            sx={{ flex: 1 }}
          >
            Müşteriye Özel Sipariş Ekle
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  // Processing Screen
  return (
    <Dialog
      open={showPaymentDialog}
      onClose={undefined}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
          Ödeme İşleniyor
        </Typography>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            Ödemeniz işleniyor...
          </Typography>
          <Box sx={{ mt: 3, mb: 2 }}>
            <LinearProgress sx={{ height: 8, borderRadius: 4 }} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Lütfen bekleyin, ödeme onaylanıyor.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog; 