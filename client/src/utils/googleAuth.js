// Google Identity Services (GIS) Helper

let scriptPromise = null;

export const loadGoogleScript = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window is undefined'));
  
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById('google-gsi-client');
    if (existing) {
      existing.onload = () => resolve(window.google);
      existing.onerror = (e) => reject(e);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Failed to load Google Identity Services SDK'));
    document.head.appendChild(script);
  });

  return scriptPromise;
};

export const triggerGoogleAuth = async ({ onSuccess, onError, onStart }) => {
  try {
    if (onStart) onStart();
    const google = await loadGoogleScript();
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId || clientId.includes('your_google_client_id')) {
      throw new Error('Google Sign-In is not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment.');
    }

    if (!google?.accounts?.id) {
      throw new Error('Google Identity Services SDK is not ready.');
    }

    google.accounts.id.initialize({
      client_id: clientId,
      callback: (res) => {
        if (res?.credential) {
          onSuccess(res.credential);
        } else {
          onError(new Error('Google sign-in did not return a credential.'));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Create a temporary hidden container to render and click GIS button to trigger Google popup
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.visibility = 'hidden';
    document.body.appendChild(tempContainer);

    google.accounts.id.renderButton(tempContainer, {
      type: 'standard',
      shape: 'rectangular',
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      click_listener: () => {},
    });

    const googleBtn = tempContainer.querySelector('div[role="button"]') || tempContainer.querySelector('iframe') || tempContainer.firstElementChild;
    if (googleBtn) {
      // Also try One Tap prompt as parallel fallback
      google.accounts.id.prompt();
      googleBtn.click();
    } else {
      google.accounts.id.prompt();
    }

    // Clean up temporary container after 30 seconds
    setTimeout(() => {
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    }, 30000);

  } catch (err) {
    if (onError) {
      onError(err);
    }
  }
};
