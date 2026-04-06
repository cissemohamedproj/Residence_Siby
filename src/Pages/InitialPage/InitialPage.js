import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './InitialPage.css';
import { companyLogo, companyServices2 } from '../CompanyInfo/CompanyInfo';

const SPLASH_MS = 9000;

const InitialPage = () => {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      setProgress(Math.min(100, (elapsed / SPLASH_MS) * 100));
      if (elapsed < SPLASH_MS) {
        requestAnimationFrame(tick);
      }
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      navigate('/home');
    }, SPLASH_MS);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className='initial-page'>
      <div className='initial-page__noise' aria-hidden />
      <AnimatePresence mode='wait'>
        {showSplash && (
          <motion.div
            className='initial-page__content'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className='initial-page__logo-wrap'
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src={companyLogo} alt='Logo' className='initial-page__logo' />
            </motion.div>

            <motion.h1
              className='initial-page__title'
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.55 }}
            >
              Bienvenue sur Résidence Siby
            </motion.h1>

            <motion.p
              className='initial-page__tagline'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              {companyServices2}
            </motion.p>

            <div
              className='initial-page__progress'
              role='progressbar'
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className='initial-page__progress-bar'
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className='initial-page__loading'>
              <span className='initial-page__spinner' aria-hidden />
              <p className='initial-page__hint mb-0'>
                Chargement de l&apos;application…
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InitialPage;
