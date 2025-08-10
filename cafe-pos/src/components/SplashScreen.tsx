import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Fade,
  Slide
} from '@mui/material';
import { useStore } from '../store/useStore';
import { IconButton } from '@mui/material';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';

// Logo import - bu şekilde webpack handle eder
let logoUrl: string;
try {
  logoUrl = require('../assets/Logo.png');
} catch {
  logoUrl = '';
}

const SplashScreen: React.FC = () => {
  const { completeSplashScreen } = useStore();
  const [logoError, setLogoError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);

  // Yükleme adımları
  const loadingSteps = [
    '☕ Kahve makinesi hazırlanıyor...',
    '🫘 Taze çekirdekler öğütülüyor...',
    '🥛 Süt buharı ayarlanıyor...',
    '📊 Menü sistemi yükleniyor...',
    '💰 Kasa sistemi açılıyor...',
    '✨ Son dokunuşlar yapılıyor...',
            '🎉 Lacromisa Coffee\'ye hoş geldiniz!'
  ];

  useEffect(() => {
    setShowContent(true);
    const durationMs = 3000;
    let rafId: number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(durationMs, now - start);
      const pct = Math.round((elapsed / durationMs) * 100);
      setProgress(pct);
      if (elapsed < durationMs) {
        rafId = requestAnimationFrame(tick);
      } else {
        setTimeout(() => completeSplashScreen(), 250);
      }
    };
    rafId = requestAnimationFrame(tick);
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, loadingSteps.length - 1));
    }, 400);
    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(stepInterval);
    };
  }, [completeSplashScreen, loadingSteps.length]);

  useEffect(() => {
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
      background: 'linear-gradient(135deg, #0a4940 0%, #1a5a52 25%, #2e6b63 50%, #4caf50 100%)',
      display: 'flex',
      flexDirection: 'column',
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
            boxShadow: '0 4px 20px rgba(10, 73, 64, 0.3)',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'scale(1.05)',
              boxShadow: '0 6px 25px rgba(10, 73, 64, 0.4)',
            },
            transition: 'all 0.3s ease',
            border: '3px solid white'
          }}
        >
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Box>
      {/* Arka plan ışık parçacıkları */}
      {[...Array(14)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: `${Math.random() * 10 + 6}px`,
            height: `${Math.random() * 10 + 6}px`,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float${i % 3} ${3.5 + Math.random() * 3.5}s infinite ease-in-out`,
            '@keyframes float0': {
              '0%, 100%': { transform: 'translateY(0px) scale(1)', opacity: 0.3 },
              '50%': { transform: 'translateY(-30px) scale(1.2)', opacity: 0.8 }
            },
            '@keyframes float1': {
              '0%, 100%': { transform: 'translateX(0px) scale(1)', opacity: 0.4 },
              '50%': { transform: 'translateX(20px) scale(1.1)', opacity: 0.9 }
            },
            '@keyframes float2': {
              '0%, 100%': { transform: 'rotate(0deg) scale(1)', opacity: 0.2 },
              '50%': { transform: 'rotate(180deg) scale(1.3)', opacity: 0.7 }
            }
          }}
        />
      ))}

      {/* Coffee steam effect */}
      <Box sx={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 2,
        opacity: 0.6
      }}>
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              width: '4px',
              height: '40px',
              background: 'linear-gradient(to top, transparent, white, transparent)',
              borderRadius: '2px',
              animation: `steam ${1.5 + i * 0.3}s infinite ease-in-out`,
              animationDelay: `${i * 0.2}s`,
              '@keyframes steam': {
                '0%': { 
                  transform: 'translateY(0px) scaleY(1)',
                  opacity: 0 
                },
                '50%': { 
                  transform: 'translateY(-20px) scaleY(1.5)',
                  opacity: 0.8 
                },
                '100%': { 
                  transform: 'translateY(-40px) scaleY(0.5)',
                  opacity: 0 
                }
              }
            }}
          />
        ))}
      </Box>

      <Fade in={showContent} timeout={600}>
        <Box sx={{
          textAlign: 'center',
          maxWidth: '680px',
          px: 4,
          py: 5,
          borderRadius: 6,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.28)',
          border: '1px solid rgba(255,255,255,0.35)'
        }}>
          {/* Ana Logo */}
          <Slide direction="up" in={showContent} timeout={900}>
            <Box sx={{
              mb: 4,
              animation: 'logoEnter 1.5s ease-out',
              '@keyframes logoEnter': {
                '0%': { 
                  opacity: 0, 
                  transform: 'scale(0.3) translateY(50px)',
                },
                '70%': { 
                  transform: 'scale(1.05) translateY(-10px)',
                },
                '100%': { 
                  opacity: 1, 
                  transform: 'scale(1) translateY(0)',
                }
              }
            }}>
              {!logoError && logoUrl ? (
                <img 
                  src={logoUrl}
                  alt="Lacromisa Cafe Logo"
                  style={{ 
                    width: '200px', 
                    height: '200px', 
                    objectFit: 'cover',
                    borderRadius: '50%',
                    filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.4))',
                    border: '4px solid rgba(255,255,255,0.3)',
                    animation: 'logoGlow 2s ease-in-out infinite alternate'
                  }}
                  onError={() => setLogoError(true)}
                  onLoad={() => setLogoError(false)}
                />
              ) : (
                <Box sx={{
                  width: '200px', 
                  height: '200px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  color: '#0a4940',
                  border: '4px solid rgba(255,255,255,0.3)',
                  filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.4))',
                  mx: 'auto'
                }}>
                  ☕
                </Box>
              )}
            </Box>
          </Slide>

          {/* Başlık */}
          <Fade in={showContent} timeout={1200} style={{ transitionDelay: '0.3s' }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" sx={{ 
                color: 'white',
                fontWeight: 700,
                mb: 1,
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                letterSpacing: 1,
                background: 'linear-gradient(45deg, #ffffff 30%, #f0f0f0 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                LACROMISA COFFEE
              </Typography>
              <Typography variant="h6" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontWeight: 300,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                letterSpacing: 0.5
              }}>
                Professional POS System
              </Typography>
            </Box>
          </Fade>

          {/* Progress Bar - 3 sn */}
          <Fade in={showContent} timeout={800} style={{ transitionDelay: '0.45s' }}>
            <Box sx={{ mb: 3, width: '100%' }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{
                  height: 14,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.15)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 8,
                    background: 'linear-gradient(90deg, #00c853 0%, #1de9b6 50%, #69f0ae 100%)',
                    boxShadow: '0 0 24px rgba(0, 200, 83, 0.55)',
                    animation: 'progressGlow 1.6s ease-in-out infinite alternate',
                  }
                }}
              />
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mt: 1 
              }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.9rem'
                }}>
                  %{Math.round(progress)}
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.9rem'
                }}>
                   {progress < 100 ? 'Yükleniyor...' : 'Hazır!'}
                </Typography>
              </Box>
            </Box>
          </Fade>

          {/* Loading Steps */}
          <Fade in={showContent} timeout={900} style={{ transitionDelay: '0.75s' }}>
            <Box sx={{ mb: 4, minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" sx={{ 
                color: 'white',
                fontWeight: 500,
                textAlign: 'center',
                textShadow: '0 2px 10px rgba(0,0,0,0.4)',
                fontSize: '1.2rem',
                animation: 'textPulse 1s ease-in-out infinite alternate',
                '@keyframes textPulse': {
                  '0%': { opacity: 0.8, transform: 'scale(1)' },
                  '100%': { opacity: 1, transform: 'scale(1.02)' }
                }
              }}>
                {loadingSteps[currentStep]}
              </Typography>
            </Box>
          </Fade>

          {/* Fun Loading Dots */}
          <Fade in={showContent} timeout={800} style={{ transitionDelay: '0.95s' }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}>
              {[...Array(5)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    animation: `bounce 1.4s infinite ease-in-out`,
                    animationDelay: `${i * 0.16}s`,
                    '@keyframes bounce': {
                      '0%, 80%, 100%': { 
                        transform: 'scale(0.8)',
                        opacity: 0.5
                      },
                      '40%': { 
                        transform: 'scale(1.2)',
                        opacity: 1
                      }
                    }
                  }}
                />
              ))}
            </Box>
          </Fade>
        </Box>
      </Fade>

      {/* Global CSS for animations */}
      <style>
        {`
          @keyframes logoGlow {
            0% { 
              filter: drop-shadow(0 0 20px rgba(255,255,255,0.4));
              transform: scale(1);
            }
            100% { 
              filter: drop-shadow(0 0 40px rgba(255,255,255,0.7));
              transform: scale(1.02);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default SplashScreen; 