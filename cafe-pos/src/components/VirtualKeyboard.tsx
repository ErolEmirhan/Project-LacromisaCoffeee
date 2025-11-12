import React from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Slide,
  Fade
} from '@mui/material';
import {
  Backspace as BackspaceIcon,
  KeyboardReturn as EnterIcon,
  SpaceBar as SpaceIcon,
  Close as CloseIcon,
  KeyboardArrowUp as ShiftIcon
} from '@mui/icons-material';

interface VirtualKeyboardProps {
  open: boolean;
  onClose: () => void;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  currentValue: string;
}

const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  open,
  onClose,
  onKeyPress,
  onBackspace,
  onClear,
  currentValue
}) => {
  const [isShiftPressed, setIsShiftPressed] = React.useState(false);
  const [isNumeric, setIsNumeric] = React.useState(false);

  // Türkçe Q klavye düzeni
  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'ı', 'o', 'p', 'ğ', 'ü'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ş', 'i'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', 'ö', 'ç']
  ];

  // Sayısal klavye
  const numericKeyboard = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0']
  ];

  const handleKeyPress = (key: string) => {
    let processedKey = key;
    
    if (isShiftPressed && !isNumeric) {
      processedKey = key.toUpperCase();
      setIsShiftPressed(false); // Shift'i tek kullanım için sıfırla
    }
    
    onKeyPress(processedKey);
  };

  const toggleShift = () => {
    setIsShiftPressed(!isShiftPressed);
  };

  const toggleKeyboardType = () => {
    setIsNumeric(!isNumeric);
    setIsShiftPressed(false);
  };

  const handleSpace = () => {
    onKeyPress(' ');
  };

  if (!open) return null;

  return (
    <Fade in={open} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2000,
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          p: 2
        }}
        onClick={onClose}
      >
        <Slide direction="up" in={open} timeout={400}>
          <Paper
            onClick={(e) => e.stopPropagation()}
                         sx={{
               width: '100%',
               maxWidth: '1200px',
               borderRadius: 4,
               p: 4,
               background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
               boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
               border: '2px solid rgba(217, 67, 134, 0.1)',
               transform: 'translateY(0)',
             }}
          >
            {/* Klavye Başlığı */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  color: 'primary.main' 
                }}>
                  ⌨️ Sanal Klavye
                </Typography>
                <Button
                  variant={isNumeric ? "contained" : "outlined"}
                  size="small"
                  onClick={toggleKeyboardType}
                  sx={{ 
                    borderRadius: 2,
                    minWidth: '80px',
                    fontSize: '0.8rem'
                  }}
                >
                  {isNumeric ? 'ABC' : '123'}
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onClear}
                  sx={{ 
                    borderRadius: 2,
                    color: 'error.main',
                    borderColor: 'error.main',
                    '&:hover': {
                      backgroundColor: 'error.main',
                      color: 'white'
                    }
                  }}
                >
                  Temizle
                </Button>
                                 <IconButton
                   onClick={onClose}
                   size="large"
                   sx={{
                     width: 60,
                     height: 60,
                     bgcolor: 'error.main',
                     color: 'white',
                     border: '3px solid white',
                     boxShadow: '0 4px 20px rgba(220, 53, 69, 0.4)',
                     '&:hover': {
                       bgcolor: 'error.dark',
                       transform: 'scale(1.05)',
                       boxShadow: '0 6px 25px rgba(220, 53, 69, 0.6)',
                     },
                     '&:active': {
                       transform: 'scale(0.95)'
                     },
                     transition: 'all 0.2s ease'
                   }}
                 >
                   <CloseIcon sx={{ fontSize: '2rem' }} />
                 </IconButton>
              </Box>
            </Box>

            {/* Mevcut Değer Gösterimi */}
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 2,
              border: '2px solid rgba(217, 67, 134, 0.1)'
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Girilen Metin:
              </Typography>
              <Typography variant="h6" sx={{ 
                fontFamily: 'monospace',
                color: 'primary.main',
                minHeight: '24px',
                wordBreak: 'break-all'
              }}>
                {currentValue || 'Arama metni buraya gelecek...'}
              </Typography>
            </Box>

            {/* Klavye Tuşları */}
            {isNumeric ? (
              // Sayısal Klavye
                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                 {numericKeyboard.map((row, rowIndex) => (
                   <Box key={rowIndex} sx={{ 
                     display: 'flex', 
                     justifyContent: 'center',
                     gap: 2.5 
                   }}>
                    {row.map((key) => (
                      <Button
                        key={key}
                        variant="contained"
                        size="large"
                        onClick={() => handleKeyPress(key)}
                                                 sx={{
                           minWidth: '120px',
                           height: '80px',
                           fontSize: '2rem',
                           fontWeight: 600,
                           borderRadius: 4,
                          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                          color: 'primary.main',
                          border: '2px solid rgba(217, 67, 134, 0.1)',
                          boxShadow: '0 4px 12px rgba(217, 67, 134, 0.15)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(217, 67, 134, 0.25)',
                            background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                          },
                          '&:active': {
                            transform: 'translateY(0)',
                            boxShadow: '0 2px 8px rgba(217, 67, 134, 0.2)',
                          }
                        }}
                      >
                        {key}
                      </Button>
                    ))}
                  </Box>
                ))}
                
                                 {/* Sayısal klavye alt tuşları */}
                 <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, mt: 2 }}>
                                     <Button
                     variant="outlined"
                     size="large"
                     onClick={handleSpace}
                     startIcon={<SpaceIcon sx={{ fontSize: '1.5rem' }} />}
                     sx={{
                       minWidth: '300px',
                       height: '70px',
                       borderRadius: 4,
                       fontSize: '1.3rem',
                       fontWeight: 600,
                       borderWidth: 3
                     }}
                   >
                     Boşluk
                   </Button>
                   <Button
                     variant="outlined"
                     size="large"
                     onClick={onBackspace}
                     startIcon={<BackspaceIcon sx={{ fontSize: '1.5rem' }} />}
                     sx={{
                       minWidth: '180px',
                       height: '70px',
                       borderRadius: 4,
                       fontSize: '1.3rem',
                       fontWeight: 600,
                       borderWidth: 3,
                       color: 'error.main',
                       borderColor: 'error.main',
                       '&:hover': {
                         backgroundColor: 'error.main',
                         color: 'white',
                         transform: 'scale(1.02)'
                       }
                     }}
                   >
                     Sil
                   </Button>
                </Box>
              </Box>
            ) : (
                             // Alfabetik Klavye
               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                 {keyboardRows.map((row, rowIndex) => (
                   <Box key={rowIndex} sx={{ 
                     display: 'flex', 
                     justifyContent: 'center',
                     gap: 1.5 
                   }}>
                    {row.map((key) => (
                      <Button
                        key={key}
                        variant="contained"
                        size="large"
                        onClick={() => handleKeyPress(key)}
                                                 sx={{
                           minWidth: rowIndex === 0 ? '70px' : '65px',
                           height: '70px',
                           fontSize: rowIndex === 0 ? '1.6rem' : '1.4rem',
                           fontWeight: 600,
                           borderRadius: 3,
                          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                          color: 'primary.main',
                          border: '2px solid rgba(217, 67, 134, 0.1)',
                          boxShadow: '0 3px 8px rgba(217, 67, 134, 0.12)',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(217, 67, 134, 0.2)',
                            background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
                          },
                          '&:active': {
                            transform: 'translateY(0)',
                            boxShadow: '0 2px 6px rgba(217, 67, 134, 0.15)',
                          }
                        }}
                      >
                        {isShiftPressed && rowIndex > 0 ? key.toUpperCase() : key}
                      </Button>
                    ))}
                  </Box>
                ))}
                
                                 {/* Alt tuş sırası */}
                 <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                                     <Button
                     variant={isShiftPressed ? "contained" : "outlined"}
                     size="large"
                     onClick={toggleShift}
                     startIcon={<ShiftIcon sx={{ fontSize: '1.5rem' }} />}
                     sx={{
                       minWidth: '140px',
                       height: '70px',
                       borderRadius: 4,
                       fontSize: '1.2rem',
                       fontWeight: 600,
                       borderWidth: 3,
                       bgcolor: isShiftPressed ? 'primary.main' : 'transparent',
                       color: isShiftPressed ? 'white' : 'primary.main',
                       '&:hover': {
                         transform: 'scale(1.02)'
                       }
                     }}
                   >
                     Shift
                   </Button>
                   
                   <Button
                     variant="outlined"
                     size="large"
                     onClick={handleSpace}
                     startIcon={<SpaceIcon sx={{ fontSize: '1.8rem' }} />}
                     sx={{
                       minWidth: '400px',
                       height: '70px',
                       borderRadius: 4,
                       fontSize: '1.3rem',
                       fontWeight: 600,
                       borderWidth: 3,
                       '&:hover': {
                         transform: 'scale(1.02)'
                       }
                     }}
                   >
                     Boşluk
                   </Button>
                   
                   <Button
                     variant="outlined"
                     size="large"
                     onClick={onBackspace}
                     startIcon={<BackspaceIcon sx={{ fontSize: '1.5rem' }} />}
                     sx={{
                       minWidth: '140px',
                       height: '70px',
                       borderRadius: 4,
                       fontSize: '1.2rem',
                       fontWeight: 600,
                       borderWidth: 3,
                       color: 'error.main',
                       borderColor: 'error.main',
                       '&:hover': {
                         backgroundColor: 'error.main',
                         color: 'white',
                         transform: 'scale(1.02)'
                       }
                     }}
                   >
                     Sil
                   </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Slide>
      </Box>
    </Fade>
  );
};

export default VirtualKeyboard; 