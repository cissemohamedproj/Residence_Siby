export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatPhoneNumber = (number) => {
  if (!number) return '';
  // formatez seulement en mettant espace entre les chiffres et en ajoutant un tiret après chaque 2 chiffres sans limite de longueur
  const digits = String(number).replace(/\D/g, ''); // supprime tous les caractères non numériques
  return digits.replace(/(\d{2})(?=\d)/g, '$1-').replace(/-$/, '');
  
  // const digits = String(number).replace(/\D/g, '').slice(0, 8); // max 8 chiffres
  // return digits.replace(/(\d{2})(?=\d)/g, '$1-').replace(/-$/, '');
};

export const formatPrice = (number) => {
  if (number == null || number === '') return '—';

  // Toujours transformer en string
  const str = number.toString();

  // Séparer la partie entière et décimale
  const [entier, decimal] = str.split('.');

  // Formater la partie entière (123456 → 123 456)
  const entierFormate = entier.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  // Si décimal existe → on le rattache
  return decimal ? `${entierFormate}.${decimal}` : entierFormate;
};
