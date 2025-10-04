import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SkipForward, Loader2 } from 'lucide-react';

const INTRO_SEEN_KEY = 'hyper-faith-intro-seen';
const SKIP_BUTTON_DELAY = 3000; // Show skip button after 3 seconds

// Detect if user is on mobile device
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth < 768;
};

export default function Landing() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile] = useState(isMobileDevice());

  // Check if user has already seen the intro
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem(INTRO_SEEN_KEY);
    if (hasSeenIntro === 'true') {
      // User has seen intro before, redirect immediately
      navigate('/mint', { replace: true });
    }
  }, [navigate]);

  // Show skip button after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkipButton(true);
    }, SKIP_BUTTON_DELAY);

    return () => clearTimeout(timer);
  }, []);

  // Handle video loaded
  const handleVideoCanPlay = () => {
    setIsLoading(false);
  };

  // Handle video error
  const handleVideoError = () => {
    console.error('Video failed to load');
    setHasError(true);
    setIsLoading(false);
  };

  // Handle video end
  const handleVideoEnd = () => {
    proceedToMint();
  };

  // Navigate to mint page with transition
  const proceedToMint = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    // Mark intro as seen
    localStorage.setItem(INTRO_SEEN_KEY, 'true');
    
    // Fade out and navigate
    setTimeout(() => {
      navigate('/mint', { replace: true });
    }, 500);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        proceedToMint();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isTransitioning]);

  // If error, show fallback
  if (hasError) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center space-y-6 p-8">
          <div className="space-y-2">
            <h1 className="font-mono text-4xl md:text-6xl font-bold">hyper.faith</h1>
            <p className="text-muted-foreground">Orderbook Omamori</p>
          </div>
          <Button 
            onClick={proceedToMint}
            size="lg"
            className="font-mono"
          >
            Enter Site
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 bg-black z-50 transition-opacity duration-500 ${
        isTransitioning ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="font-mono text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        onCanPlay={handleVideoCanPlay}
        onError={handleVideoError}
        onEnded={handleVideoEnd}
        className="absolute inset-0 w-full h-full object-cover"
        aria-label="Introduction video for hyper.faith"
      >
        {isMobile ? (
          <>
            <source src="/intro-video-mobile.mp4" type="video/mp4" />
            <source src="/intro-video-mobile.webm" type="video/webm" />
          </>
        ) : (
          <>
            <source src="/intro-video.mp4" type="video/mp4" />
            <source src="/intro-video.webm" type="video/webm" />
          </>
        )}
        Your browser does not support the video tag.
      </video>

      {/* Skip Button - Responsive Positioning */}
      {showSkipButton && !isLoading && !isTransitioning && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center md:left-auto md:right-8 md:justify-end animate-fade-in">
          <Button
            onClick={proceedToMint}
            variant="secondary"
            size="lg"
            className="font-mono shadow-lg hover-lift px-8 py-6 md:px-6 md:py-3"
            aria-label="Skip introduction video"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip Intro
          </Button>
        </div>
      )}

      {/* Keyboard Hint - Desktop Only */}
      {showSkipButton && !isLoading && !isTransitioning && (
        <div className="hidden md:block absolute bottom-8 left-8 text-sm text-white/60 font-mono animate-fade-in">
          Press ESC, Space, or Enter to skip
        </div>
      )}
    </div>
  );
}

