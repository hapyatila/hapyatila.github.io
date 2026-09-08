/**
 * Lecture du questionnaire mise en demeure → objet réponses pour le template.
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

const OBLIGATION_LABELS = {
  reparations:
    'grosses réparations, vétusté, vice de construction, non-conformité préexistante ou structure',
  jouissance:
    'délivrance conforme, jouissance paisible, vices, grosses réparations, absence de trouble',
  travaux: 'répartition des travaux et conformité professionnelle',
  confidentialite: 'confidentialité, secret professionnel et accès aux locaux',
};

const CONSEQUENCE_LABELS = {
  fermeture: 'Fermeture',
  annulation: 'Annulation de soins',
  interdiction: 'Interdiction administrative',
  penal: 'Risque pénal',
  acces: "Perte d'accès",
  confidentialite: 'Perte de confidentialité',
  degats: 'Dégâts matériels',
  sante: 'Risque de santé pour les personnes',
};

function checkedLabels(name, labels) {
  const out = [];
  document.querySelectorAll('input[name="' + name + '"]:checked').forEach(function (el) {
    const lbl = labels[el.value];
    if (lbl) out.push(lbl);
  });
  return out;
}

/** @returns {Record<string, string|boolean>} */
export function collectAnswers() {
  const representant = val('representant-bailleur');
  const precision = val('precision-local');
  const autreObligation = val('obligation-autre');
  const autreConsequence = val('consequence-autre');
  const travauxDesc = val('mesure-travaux');
  const reparationDesc = val('mesure-reparation');
  const accesDesc = val('mesure-acces');
  const autreMesure = val('mesure-autre');

  const obligations = checkedLabels('obligations', OBLIGATION_LABELS);
  if (autreObligation) obligations.push(autreObligation);

  const consequences = checkedLabels('consequences', CONSEQUENCE_LABELS);
  if (autreConsequence) consequences.push(autreConsequence);

  const mesures = [];
  if (travauxDesc) mesures.push('Travaux : ' + travauxDesc);
  if (reparationDesc) mesures.push('Réparation : ' + reparationDesc);
  if (accesDesc) mesures.push("Rétablissement d'accès : " + accesDesc);
  if (autreMesure) mesures.push('Autre : ' + autreMesure);

  const persistance = hiddenVal('persistance', 'oui');
  const persistanceDetail =
    persistance === 'oui'
      ? val('persistance-detail', 'Le manquement est toujours en cours.')
      : 'Non renseigné';

  let blocRepresentant = '';
  if (representant) {
    blocRepresentant = 'Copie : ' + representant;
  }

  return {
    identiteBailleur: val('identite-bailleur', 'Non renseigné'),
    adresseBailleur: val('adresse-bailleur', 'Non renseigné'),
    representantBailleur: representant,
    blocRepresentant: blocRepresentant,
    identitePreneur: val('identite-preneur', 'Non renseigné'),
    adressePreneur: val('adresse-preneur', 'Non renseigné'),
    adresseLocaux: val('adresse-locaux', 'Non renseigné'),
    precisionLocal: precision ? ', ' + precision : '',
    dateSignatureBail: formatDateFr('date-bail'),
    obligationsInexecutees: obligations.length
      ? obligations.join(' ; ')
      : 'Non renseigné',
    descriptionFactuelle: val('description-faits', 'Non renseigné'),
    dateDebutManquement: formatDateFr('date-debut-manquement'),
    persistanceDetail: persistanceDetail,
    impossibiliteUsage: val('impossibilite-usage', 'Non renseigné'),
    consequencesConcretes: consequences.length
      ? consequences.join(', ')
      : 'Non renseigné',
    mesuresDemandees: mesures.length ? mesures.join(' ; ') : 'Non renseigné',
    delaiRaisonnable: val('delai-raisonnable', 'Non renseigné'),
    listePieces: val('liste-pieces', 'Néant'),
  };
}
