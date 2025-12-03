import { useEffect } from 'react';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LfdDiAsAAAAAA9FWJ-pz0_j1DBAcnY_RYcV9TxN';

export const useRecaptcha = () => {
  useEffect(() => {
    const loadRecaptcha = async () => {
      // Check if script already exists
      if (document.querySelector(`script[src*="google.com/recaptcha"]`)) {
        return;
      }

      const script = document.createElement('script');
      // Add waf=session to disable Private Access Tokens feature
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}&waf=session`;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        console.error('Failed to load reCAPTCHA script');
      };

      script.onload = () => {
        console.log('reCAPTCHA script loaded successfully');
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            console.log('reCAPTCHA ready');
            executeRecaptcha();
          });
        }
      };

      document.head.appendChild(script);
    };

    const executeRecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.execute) {
        window.grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action: 'submit' })
          .then((token) => {
            console.log('reCAPTCHA token generated successfully');
            sessionStorage.setItem('recaptchaToken', token);
          })
          .catch((error) => {
            console.error('reCAPTCHA execution error:', error);
          });
      }
    };

    loadRecaptcha();
  }, []);

  const getToken = () => {
    return sessionStorage.getItem('recaptchaToken') || '';
  };

  const executeRecaptchaAction = (action = 'submit') => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        console.warn('reCAPTCHA not loaded yet');
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action })
          .then((token) => {
            console.log('reCAPTCHA token generated for action:', action);
            sessionStorage.setItem('recaptchaToken', token);
            resolve(token);
          })
          .catch((error) => {
            console.error('reCAPTCHA execution error:', error);
            reject(error);
          });
      });
    });
  };

  return { getToken, executeRecaptchaAction };
};
