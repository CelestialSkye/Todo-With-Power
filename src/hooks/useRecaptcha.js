import { useEffect } from 'react';

const RECAPTCHA_SITE_KEY = '6LfdDiAsAAAAAA9FWJ-pz0_j1DBAcnY_RYcV9TxN';

export const useRecaptcha = () => {
  useEffect(() => {
    const loadRecaptcha = async () => {
      if (window.grecaptcha) {
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.grecaptcha) {
          window.grecaptcha.ready(() => {
            executeRecaptcha();
          });
        }
      };
    };

    const executeRecaptcha = () => {
      if (window.grecaptcha) {
        window.grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action: 'submit' })
          .then((token) => {
            sessionStorage.setItem('recaptchaToken', token);
          })
          .catch((error) => {
            console.error('reCAPTCHA error:', error);
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
      if (window.grecaptcha) {
        window.grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action })
          .then((token) => {
            sessionStorage.setItem('recaptchaToken', token);
            resolve(token);
          })
          .catch((error) => {
            console.error('reCAPTCHA execution error:', error);
            reject(error);
          });
      } else {
        reject(new Error('reCAPTCHA not loaded'));
      }
    });
  };

  return { getToken, executeRecaptchaAction };
};
