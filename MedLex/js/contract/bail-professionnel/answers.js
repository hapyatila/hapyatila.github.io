/**
 * Lecture du questionnaire bail professionnel → réponses template.
 */

import { $, val, formatDate } from '../utils.js';

function hiddenVal(id, fallback) {
  const el = $(id);
  if (!el) return fallback || '';
  return el.value != null && String(el.value).trim() !== '' ? String(el.value).trim() : fallback || '';
}

function formatDateFr(id) {
  const raw = val(id);
  if (!raw) return 'Non renseigné';
  try {
    return formatDate(raw) || raw;
  } catch (e) {
    return raw;
  }
}

/** @returns {Record<string, string|boolean>} */
export function collectAnswers() {
  const representant = val('representant-bailleur');
  const precision = val('precision-local');
  const nature = hiddenVal('nature-immeuble', 'monopropriete');
  const tva = hiddenVal('tva-applicable', 'non');
  const sousloc = hiddenVal('sous-location', 'interdite');
  const preference = hiddenVal('droit-preference', 'non');

  return {
    identiteBailleur: val('identite-bailleur', 'Non renseigné'),
    adresseBailleur: val('adresse-bailleur', 'Non renseigné'),
    ligneRepresentant: representant
      ? 'Représenté par : ' + representant
      : '',
    identitePreneur: val('identite-preneur', 'Non renseigné'),
    ordinalPreneur: val('ordinal-preneur', 'Non renseigné'),
    rppsPreneur: val('rpps-preneur', 'Non renseigné'),
    adressePreneur: val('adresse-preneur', 'Non renseigné'),
    adresseLocaux: val('adresse-locaux', 'Non renseigné'),
    precisionLocal: precision || '—',
    superficie: val('superficie', 'Non renseigné'),
    descriptionPieces: val('description-pieces', 'Non renseigné'),
    natureImmeuble: nature,
    natureAutreDetail: val('nature-autre', ''),
    dateEffet: formatDateFr('date-effet'),
    dateExpiration: formatDateFr('date-expiration'),
    loyerHc: val('loyer-hc', 'Non renseigné'),
    tvaApplicable: tva === 'oui',
    tauxTva: val('taux-tva', ''),
    loyerTtc: val('loyer-ttc', ''),
    provisionCharges: val('provision-charges', 'Non renseigné'),
    depotGarantie: val('depot-garantie', 'Non renseigné'),
    sousLocation: sousloc,
    droitPreference: preference === 'oui',
  };
}
