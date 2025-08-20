import { useEffect } from 'react';
import BackgroundRemoverApp from "./components/BackgroundRemoverApp";

function App() {
  useEffect(() => {
    // Lifetime Access Check
    const checkLifetimeAccess = () => {
      const params = new URLSearchParams(window.location.search);
      const lifetimeKey = params.get('lifetime');
      
      if (lifetimeKey === 'gumroad2024') {
        localStorage.setItem('bgimg_lifetime', 'true');
        alert('✅ Lifetime access activated! Enjoy unlimited background removal.');
        // Remove the key from URL to hide it
        window.history.replaceState({}, '', window.location.pathname);
      }
    };
    
    checkLifetimeAccess();
  }, []); // Run once when app loads

  return <BackgroundRemoverApp />;
}

export default App;