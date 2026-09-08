/**
 * Snapshot questionnaire fin de bail — délègue au module parcours UI.
 */

export function collectQuestionnaireSnapshot() {
  if (window.ParcoursFinDeBailSnapshot) {
    return window.ParcoursFinDeBailSnapshot.collect();
  }
  return null;
}

export function applyQuestionnaireSnapshot(snap) {
  if (window.ParcoursFinDeBailSnapshot) {
    return window.ParcoursFinDeBailSnapshot.apply(snap);
  }
  return false;
}
