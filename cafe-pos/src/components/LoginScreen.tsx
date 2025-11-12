import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import {
  Lock as LockIcon,
  Backspace as BackspaceIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useStore } from '../store/useStore';

const LoginScreen: React.FC = () => {
  const {
    enteredPassword,
    loginError,
    addPasswordDigit,
    removePasswordDigit,
    clearPassword,
    attemptLogin
  } = useStore();

  // 4 haneli şifre girildiğinde otomatik giriş denemesi
  useEffect(() => {
    if (enteredPassword.length === 4) {
      const timer = setTimeout(() => {
        attemptLogin();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [enteredPassword, attemptLogin]);

  const handleDigitClick = (digit: string) => {
    addPasswordDigit(digit);
  };

  const keypadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0']
  ];

  const [isFullscreen, setIsFullscreen] = React.useState(true);

  React.useEffect(() => {
    const check = async () => {
      try {
        // @ts-ignore
        const fullscreen = await window.electronAPI?.isFullscreen?.();
        if (typeof fullscreen === 'boolean') setIsFullscreen(fullscreen);
      } catch {}
    };
    check();
  }, []);

  const toggleFullscreen = async () => {
    try {
      // @ts-ignore
      await window.electronAPI?.toggleFullscreen?.();
      setTimeout(async () => {
        try {
          // @ts-ignore
          const fullscreen = await window.electronAPI?.isFullscreen?.();
          if (typeof fullscreen === 'boolean') setIsFullscreen(fullscreen);
        } catch {}
      }, 100);
    } catch {}
  };

  return (
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      background: 'linear-gradient(135deg, #d94386 0%, #c9508a 25%, #e36ba3 50%, #e91e63 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      zIndex: 9999
    }}>
      {/* Tam ekran toggle - sağ alt (ana ekranla aynı konum) */}
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 10000 }}>
        <IconButton
          onClick={toggleFullscreen}
          size="large"
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: 60,
            height: 60,
            boxShadow: '0 4px 20px rgba(217, 67, 134, 0.3)',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 25px rgba(217, 67, 134, 0.4)',
            },
            transition: 'all 0.3s ease',
            border: '3px solid white'
          }}
        >
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Box>
      {/* Arka plan dekoratif elemanlar */}
      <Box sx={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '40%',
        height: '40%',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '-15%',
        left: '-15%',
        width: '50%',
        height: '50%',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)',
        zIndex: 0
      }} />

      <Paper sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: { xs: 4, sm: 6 },
        textAlign: 'center',
        width: { xs: '95vw', sm: '480px' },
        maxWidth: '480px',
        height: 'fit-content',
        maxHeight: '95vh',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(30px)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
        border: '2px solid rgba(255,255,255,0.4)',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Kompakt Header */}
        <Box sx={{ 
          mb: 2,
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center'
        }}>
          <Box
            component="img"
            src={require('../assets/Logo.png')}
            alt="Cafe Logo"
            sx={{
              width: { xs: 80, sm: 100 },
              height: { xs: 80, sm: 100 },
              borderRadius: '50%',
              mb: 1.5,
              boxShadow: '0 8px 32px rgba(217, 67, 134, 0.4)',
              border: '3px solid rgba(255, 255, 255, 0.9)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 12px 40px rgba(217, 67, 134, 0.5)'
              }
            }}
          />
          <Typography variant="h6" sx={{ 
            color: 'text.secondary', 
            fontWeight: 600,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            mb: 1
          }}>
            Kasa Şifresi Girin
          </Typography>
        </Box>

        {/* Kompakt Şifre Göstergesi */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 1.5
          }}>
            <LockIcon sx={{ 
              fontSize: { xs: 32, sm: 40 }, 
              color: 'primary.main'
            }} />
          </Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: { xs: 2, sm: 2.5 },
            mb: 1
          }}>
            {[0, 1, 2, 3].map((index) => (
              <Box
                key={index}
                sx={{
                  width: { xs: 18, sm: 22 },
                  height: { xs: 18, sm: 22 },
                  borderRadius: '50%',
                  border: 2,
                  borderColor: enteredPassword.length > index ? 'primary.main' : 'grey.300',
                  bgcolor: enteredPassword.length > index ? 'primary.main' : 'transparent',
                  transition: 'all 0.3s ease',
                  transform: enteredPassword.length > index ? 'scale(1.1)' : 'scale(1)'
                }}
              />
            ))}
          </Box>
          <Typography variant="caption" sx={{ 
            color: 'text.secondary',
            fontSize: { xs: '0.7rem', sm: '0.75rem' }
          }}>
            {enteredPassword.length}/4 hane
          </Typography>
        </Box>

        {/* Kompakt Tuş Takımı */}
        <Box sx={{ mb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ mb: 2 }}>
            {keypadNumbers.slice(0, 3).map((row, rowIndex) => (
              <Box key={rowIndex} sx={{ display: 'flex', gap: 1.5, mb: 1.5, justifyContent: 'center' }}>
                {row.map((digit) => (
                  <Button
                    key={digit}
                    variant="contained"
                    size="large"
                    onClick={() => handleDigitClick(digit)}
                    disabled={enteredPassword.length >= 4}
                    sx={{
                      width: { xs: 90, sm: 110 },
                      height: { xs: 55, sm: 65 },
                      fontSize: { xs: '1.5rem', sm: '1.8rem' },
                      fontWeight: 800,
                      borderRadius: 3,
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                      color: '#d94386',
                      border: '2px solid rgba(217, 67, 134, 0.1)',
                      boxShadow: `
                        0 6px 20px rgba(217, 67, 134, 0.15),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8)
                      `,
                      transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      '&:hover': {
                        transform: 'translateY(-2px) scale(1.02)',
                        boxShadow: `
                          0 10px 30px rgba(217, 67, 134, 0.25),
                          inset 0 1px 0 rgba(255, 255, 255, 0.9)
                        `,
                        borderColor: 'rgba(217, 67, 134, 0.2)'
                      },
                      '&:active': {
                        transform: 'translateY(0) scale(0.98)',
                        boxShadow: `inset 0 2px 4px rgba(0, 0, 0, 0.1)`
                      },
                      '&:disabled': {
                        background: 'linear-gradient(145deg, #e9ecef 0%, #dee2e6 100%)',
                        color: '#6c757d',
                        transform: 'none',
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    {digit}
                  </Button>
                ))}
              </Box>
            ))}
            
            {/* 0 Tuşu - Merkeze yerleştirilmiş */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleDigitClick('0')}
                disabled={enteredPassword.length >= 4}
                sx={{
                  width: { xs: 90, sm: 110 },
                  height: { xs: 55, sm: 65 },
                  fontSize: { xs: '1.5rem', sm: '1.8rem' },
                  fontWeight: 800,
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  color: '#d94386',
                  border: '2px solid rgba(217, 67, 134, 0.1)',
                  boxShadow: `
                    0 6px 20px rgba(217, 67, 134, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8)
                  `,
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: `
                      0 10px 30px rgba(217, 67, 134, 0.25),
                      inset 0 1px 0 rgba(255, 255, 255, 0.9)
                    `,
                    borderColor: 'rgba(217, 67, 134, 0.2)'
                  },
                  '&:active': {
                    transform: 'translateY(0) scale(0.98)',
                    boxShadow: `inset 0 2px 4px rgba(0, 0, 0, 0.1)`
                  },
                  '&:disabled': {
                    background: 'linear-gradient(145deg, #e9ecef 0%, #dee2e6 100%)',
                    color: '#6c757d',
                    transform: 'none',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                0
              </Button>
            </Box>
          </Box>
          
          {/* Kompakt Alt Butonlar */}
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              size="medium"
              onClick={removePasswordDigit}
              disabled={enteredPassword.length === 0}
              startIcon={<BackspaceIcon sx={{ fontSize: '1.2rem' }} />}
              sx={{
                px: 2.5,
                py: 1.5,
                borderRadius: 3,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 600,
                minWidth: { xs: 100, sm: 120 },
                height: { xs: 45, sm: 50 },
                borderWidth: 2,
                borderColor: 'rgba(217, 67, 134, 0.3)',
                color: '#d94386',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 15px rgba(217, 67, 134, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#d94386',
                  backgroundColor: '#d94386',
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(217, 67, 134, 0.3)',
                },
                '&:disabled': {
                  borderColor: 'rgba(108, 117, 125, 0.3)',
                  color: '#6c757d',
                  background: 'rgba(233, 236, 239, 0.5)'
                }
              }}
            >
              Sil
            </Button>
            
            <Button
              variant="outlined"
              size="medium"
              onClick={clearPassword}
              disabled={enteredPassword.length === 0}
              startIcon={<ClearIcon sx={{ fontSize: '1.2rem' }} />}
              sx={{
                px: 2.5,
                py: 1.5,
                borderRadius: 3,
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 600,
                minWidth: { xs: 100, sm: 120 },
                height: { xs: 45, sm: 50 },
                borderWidth: 2,
                borderColor: 'rgba(220, 53, 69, 0.3)',
                color: '#dc3545',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 15px rgba(220, 53, 69, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: '#dc3545',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 20px rgba(220, 53, 69, 0.3)',
                },
                '&:disabled': {
                  borderColor: 'rgba(108, 117, 125, 0.3)',
                  color: '#6c757d',
                  background: 'rgba(233, 236, 239, 0.5)'
                }
              }}
            >
              Temizle
            </Button>
          </Box>
        </Box>

        {/* Kompakt Alt bilgi */}
        <Typography variant="caption" sx={{ 
          color: 'text.secondary',
          fontSize: { xs: '0.6rem', sm: '0.7rem' },
          fontStyle: 'italic',
          mt: 1
        }}>
          📞 Teknik destek için yöneticinizle iletişime geçin
        </Typography>
      </Paper>

      {/* Hata mesajı */}
      <Snackbar
        open={!!loginError}
        autoHideDuration={3000}
        onClose={() => {}}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" sx={{ fontSize: '1.1rem' }}>
          {loginError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginScreen; 