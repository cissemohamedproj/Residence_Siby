import React from 'react';
import { formatPrice } from './capitalizeFunction';

/**
 * Affichage unifié de la durée de séjour (mois, semaines, jours, heures).
 * N’affiche que les unités strictement positives, dans cet ordre (réf. SecteurContrat).
 */
export default function DureeSejourDisplay({
  mois,
  semaine,
  jour,
  heure,
  emptyLabel = '—',
  wrapperClassName = '',
}) {
  const m = Number(mois) || 0;
  const s = Number(semaine) || 0;
  const j = Number(jour) || 0;
  const h = Number(heure) || 0;
  const hasAny = m > 0 || s > 0 || j > 0 || h > 0;

  return (
    <div
      className={`d-flex flex-column justify-content-center align-items-center ${wrapperClassName}`.trim()}
    >
      {m > 0 && (
        <span className='text-center'>
          {formatPrice(m)} mois{' '}
        </span>
      )}
      {s > 0 && (
        <span className='text-center'>
          {formatPrice(s)} semaines{' '}
        </span>
      )}
      {j > 0 && (
        <span className='text-center'>
          {formatPrice(j)} jours{' '}
        </span>
      )}
      {h > 0 && (
        <span className='text-center'>
          {formatPrice(h)} heures{' '}
        </span>
      )}
      {!hasAny && (
        <span className='text-center text-muted'>{emptyLabel}</span>
      )}
    </div>
  );
}
