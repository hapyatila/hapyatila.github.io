/**
 * Point d'entrée bail professionnel — window.MedLexBailProfessionnelContract
 */

import { collectQuestionnaireSnapshot, applyQuestionnaireSnapshot } from './snapshot.js';
import { collectAnswers } from './answers.js';
import { loadTemplate, buildContractText } from './template-engine.js';
import { buildContractRenderedHtml } from './render-html.js';
import { PDF_FILENAME } from './constants.js';

window.MedLexBailProfessionnelContract = {
  loadTemplate: loadTemplate,
  collectAnswers: collectAnswers,
  buildContractText: buildContractText,
  buildContractRenderedHtml: buildContractRenderedHtml,
  collectQuestionnaireSnapshot: collectQuestionnaireSnapshot,
  applyQuestionnaireSnapshot: applyQuestionnaireSnapshot,
  PDF_FILENAME: PDF_FILENAME,
};
