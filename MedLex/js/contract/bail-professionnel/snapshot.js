/**
 * Snapshot questionnaire bail professionnel — délègue au module parcours UI.
 */

export function collectQuestionnaireSnapshot() {
  if (window.ParcoursBailProfessionnelSnapshot) {
    return window.ParcoursBailProfessionnelSnapshot.collect();
  }
  return null;
}

export function applyQuestionnaireSnapshot(snap) {
  if (window.ParcoursBailProfessionnelSnapshot) {
    return window.ParcoursBailProfessionnelSnapshot.apply(snap);
  }
  return false;
}
