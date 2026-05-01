import React from 'react';
import {
  Pagination,
  PaginationItem,
  PaginationLink,
} from 'reactstrap';

// ------------------------------------------------------------
// OPTIMISATION UX: contrôles de pagination réutilisables
// ------------------------------------------------------------
// Objectif: ajouter la pagination sur plusieurs pages (Clients/Contrats/Reservations/Appartements)
// sans changer la logique métier des pages.
export default function PaginationControls({
  page,
  totalPages,
  onPageChange,
  // OPTIMISATION UX: permet de placer la pagination en haut (ou ailleurs)
  // et d'ajuster les marges sans dupliquer le composant.
  wrapperClassName = '',
}) {
  const safeTotal = Math.max(totalPages || 1, 1);
  const safePage = Math.min(Math.max(page || 1, 1), safeTotal);

  // Affiche une petite fenêtre de pages autour de la page courante
  const windowSize = 2;
  const start = Math.max(1, safePage - windowSize);
  const end = Math.min(safeTotal, safePage + windowSize);

  return (
    // OPTIMISATION UX: barre de pagination contrastée (styles dans residence-siby-modern.scss)
    <div
      className={`rs-pagination-bar d-flex justify-content-center ${wrapperClassName}`.trim()}
    >
      <Pagination className='pagination-rounded rs-pagination'>
        <PaginationItem disabled={safePage <= 1}>
          <PaginationLink
            previous
            onClick={(e) => {
              e.preventDefault();
              onPageChange?.(safePage - 1);
            }}
          />
        </PaginationItem>

        {safeTotal > 1 && start > 1 && (
          <PaginationItem>
            <PaginationLink
              onClick={(e) => {
                e.preventDefault();
                onPageChange?.(1);
              }}
            >
              1
            </PaginationLink>
          </PaginationItem>
        )}

        {safeTotal > 1 && start > 2 && (
          <PaginationItem disabled>
            <PaginationLink href='#'>…</PaginationLink>
          </PaginationItem>
        )}

        {safeTotal > 1 &&
          Array.from({ length: end - start + 1 }).map((_, i) => {
            const p = start + i;
            return (
              <PaginationItem active={p === safePage} key={p}>
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange?.(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            );
          })}

        {safeTotal > 1 && end < safeTotal - 1 && (
          <PaginationItem disabled>
            <PaginationLink href='#'>…</PaginationLink>
          </PaginationItem>
        )}

        {safeTotal > 1 && end < safeTotal && (
          <PaginationItem>
            <PaginationLink
              onClick={(e) => {
                e.preventDefault();
                onPageChange?.(safeTotal);
              }}
            >
              {safeTotal}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* OPTIMISATION UX: si une seule page, on affiche quand même un indicateur visible */}
        {safeTotal <= 1 && (
          <PaginationItem active>
            <PaginationLink
              href='#'
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              1
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem disabled={safePage >= safeTotal}>
          <PaginationLink
            next
            onClick={(e) => {
              e.preventDefault();
              onPageChange?.(safePage + 1);
            }}
          />
        </PaginationItem>
      </Pagination>
    </div>
  );
}

