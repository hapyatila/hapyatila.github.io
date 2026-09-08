/**
 * Snapshot questionnaire mise en demeure — délègue au module parcours UI.
 */

export function collectQuestionnaireSnapshot() {
  if (window.ParcoursMiseEnDemeureSnapshot) {
    return window.ParcoursMiseEnDemeureSnapshot.collect();
  }
  return null;
}

export function applyQuestionnaireSnapshot(snap) {
  if (window.ParcoursMiseEnDemeureSnapshot) {
    return window.ParcoursMiseEnDemeureSnapshot.apply(snap);
  }
  return false;
}
