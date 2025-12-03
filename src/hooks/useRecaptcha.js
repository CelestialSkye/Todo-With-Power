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
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            // reCAPTCHA ready
          });
        }
      };

      document.head.appendChild(script);
    };

    loadRecaptcha();
  }, []);

  const getToken = () => {
    return sessionStorage.getItem('recaptchaToken') || '';
  };

  const executeRecaptchaAction = (action = 'submit') => {
    return new Promise((resolve, reject) => {
      if (!window.grecaptcha) {
        reject(new Error('reCAPTCHA not loaded'));
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action })
          .then((token) => {
            sessionStorage.setItem('recaptchaToken', token);
            resolve(token);
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  };

  return { getToken, executeRecaptchaAction };
};
