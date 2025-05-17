import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      setIsNavigating(true);
      
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      
      setTimeout(() => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        setIsNavigating(false);
      }, 300);
    }
    
  }, [pathname]);


  return (
    <>
      {isNavigating && (
        <div className="fixed top-0 left-0 w-full h-1 z-[9999] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 animate-pulse" />
      )}
    </>
  );
}
