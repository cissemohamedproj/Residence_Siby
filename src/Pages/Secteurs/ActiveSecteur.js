export default function ActiveSecteur() {
  const selectedSecteur = localStorage.getItem('selectedSecteur');
  const secteur = JSON.parse(selectedSecteur);

  return (
    <div className='rs-active-secteur-pill mx-auto my-3 px-4 py-3 text-center'>
      <span className='rs-active-secteur-label d-block small text-uppercase mb-1'>
        Secteur actif
      </span>
      <h5 className='text-white mb-0 fw-semibold'>
        {secteur ? secteur.adresse : 'Aucun secteur sélectionné'}
      </h5>
    </div>
  );
}
