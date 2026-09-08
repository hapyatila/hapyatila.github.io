/**
 * Lecture du questionnaire fin de bail → objet réponses pour le moteur de template.
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
  const modele = hiddenVal('modele', 'A');
  const role = hiddenVal('role', 'locataire');
  const representant = val('representant-bailleur');
  const precision = val('precision-local');

  let mentionRepresentation = '';
  let ligneRepresentant = '';
  let blocRepresentant = '';

  if (representant) {
    mentionRepresentation = ', représenté(e) par ' + representant;
    ligneRepresentant = representant;
    blocRepresentant = 'S’il y en a un : ' + representant;
  }

  const precisionLocal = precision ? ', ' + precision : '';

  return {
    modele: modele,
    isModeleA: modele === 'A',
    isModeleB: modele === 'B',
    role: role,
    identiteBailleur: val('identite-bailleur', 'Non renseigné'),
    adresseBailleur: val('adresse-bailleur', 'Non renseigné'),
    representantBailleur: representant,
    identitePreneur: val('identite-preneur', 'Non renseigné'),
    adressePreneur: val('adresse-preneur', 'Non renseigné'),
    adresseLocaux: val('adresse-locaux', 'Non renseigné'),
    precisionLocal: precisionLocal,
    dateBail: formatDateFr('date-bail'),
    dateEcheance: formatDateFr('date-echeance'),
    mentionRepresentation: mentionRepresentation,
    ligneRepresentant: ligneRepresentant,
    blocRepresentant: blocRepresentant,
  };
}
