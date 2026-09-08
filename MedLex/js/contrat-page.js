/**
 * Page parcours/contrat.html — génération du texte juridique à partir du questionnaire.
 */

function loadScript(src) {
  return new Promise(function (resolve, reject) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () {
      resolve();
    };
    s.onerror = function () {
      reject(new Error('Script introuvable : ' + src));
    };
    document.head.appendChild(s);
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

var TYPE_LABELS = {
  continue: 'Remplacement continu',
  discontinu: 'Remplacement discontinu',
  planning: 'Planning variable',
};

function showError(message, questionnaireHref) {
  var doc = document.getElementById('contract-doc');
  var guided = document.getElementById('contract-guided');
  var toggle = document.querySelector('.ac-view-toggle');
  if (!doc) return;
  var href = questionnaireHref || (window.ParcoursType && window.ParcoursType.questionnaireUrl()) || 'questionnaire.html';
  var parcours = window.ParcoursType && window.ParcoursType.get();
  var title =
    parcours === 'collaboration'
      ? 'Contrat de collaboration infirmier libéral'
      : parcours === 'fin-de-bail'
        ? 'Fin de bail professionnel'
        : parcours === 'mise-en-demeure'
          ? 'Mise en demeure du bailleur'
          : parcours === 'bail-professionnel'
            ? 'Bail professionnel'
            : 'Contrat de remplacement infirmier libéral';
  if (guided) guided.innerHTML = '';
  if (toggle) toggle.classList.add('ac-hidden');
  doc.classList.remove('ac-hidden');
  doc.innerHTML =
    '<p class="ac-contract-doc__title">' +
    title +
    '</p>' +
    '<p class="ac-microcopy" style="margin-top:1rem;color:var(--ac-ink)">' +
    escapeHtml(message) +
    '</p>' +
    '<p class="ac-microcopy ac-spacer-sm"><a href="' +
    escapeHtml(href) +
    '">Revenir au questionnaire</a></p>';
}

function renderRemplacementContract(docEl, bodyText, answers, Contract) {
  var subtitle =
    escapeHtml(answers.rpNom) +
    ' et ' +
    escapeHtml(answers.rNom) +
    ' · ' +
    escapeHtml(TYPE_LABELS[answers.typeRemplacement] || 'Remplacement');

  var bodyHtml = Contract.buildContractRenderedHtml(bodyText, answers);
  docEl.innerHTML =
    '<p class="ac-contract-doc__title">Contrat de remplacement infirmier libéral</p>' +
    '<p class="ac-contract-doc__subtitle">' +
    subtitle +
    '</p>' +
    '<div class="ac-contract-doc__body">' +
    bodyHtml +
    '</div>';

  return { bodyText: bodyText, bodyHtml: bodyHtml };
}

function renderCollaborationContract(docEl, bodyText, answers, Contract) {
  var subtitle = escapeHtml(answers.tNom) + ' et ' + escapeHtml(answers.cNom);

  var bodyHtml = Contract.buildContractRenderedHtml(bodyText, answers);
  docEl.innerHTML =
    '<p class="ac-contract-doc__title">Contrat de collaboration infirmier libéral</p>' +
    '<p class="ac-contract-doc__subtitle">' +
    subtitle +
    '</p>' +
    '<div class="ac-contract-doc__body">' +
    bodyHtml +
    '</div>';

  return { bodyText: bodyText, bodyHtml: bodyHtml };
}

function renderFinDeBailContract(docEl, bodyText, answers, Contract) {
  var subtitle =
    answers.isModeleB
      ? 'Congé pour non-renouvellement (propriétaire)'
      : 'Notification de congé (locataire)';
  var parties =
    escapeHtml(answers.identitePreneur || '') +
    ' · ' +
    escapeHtml(answers.identiteBailleur || '');

  var bodyHtml = Contract.buildContractRenderedHtml(bodyText, answers);
  docEl.innerHTML =
    '<p class="ac-contract-doc__title">Fin de bail professionnel</p>' +
    '<p class="ac-contract-doc__subtitle">' +
    escapeHtml(subtitle) +
    ' — ' +
    parties +
    '</p>' +
    '<div class="ac-contract-doc__body">' +
    bodyHtml +
    '</div>';

  return { bodyText: bodyText, bodyHtml: bodyHtml };
}

function renderMiseEnDemeureContract(docEl, bodyText, answers, Contract) {
  var parties =
    escapeHtml(answers.identitePreneur || '') +
    ' → ' +
    escapeHtml(answers.identiteBailleur || '');

  var bodyHtml = Contract.buildContractRenderedHtml(bodyText, answers);
  docEl.innerHTML =
    '<p class="ac-contract-doc__title">Mise en demeure du bailleur</p>' +
    '<p class="ac-contract-doc__subtitle">' +
    parties +
    '</p>' +
    '<div class="ac-contract-doc__body">' +
    bodyHtml +
    '</div>';

  return { bodyText: bodyText, bodyHtml: bodyHtml };
}

function renderBailProfessionnelContract(docEl, bodyText, answers, Contract) {
  var subtitle =
    escapeHtml(answers.identitePreneur || '') +
    ' · ' +
    escapeHtml(answers.identiteBailleur || '');

  var bodyHtml = Contract.buildContractRenderedHtml(bodyText, answers);
  docEl.innerHTML =
    '<p class="ac-contract-doc__title">Bail professionnel</p>' +
    '<p class="ac-contract-doc__subtitle">' +
    subtitle +
    '</p>' +
    '<div class="ac-contract-doc__body">' +
    bodyHtml +
    '</div>';

  return { bodyText: bodyText, bodyHtml: bodyHtml };
}

function mountGuidedContractView(parcours, bodyText, bodyHtml) {
  if (!window.MedLexContractGuided) return;
  window.MedLexContractGuided.mount({
    bodyText: bodyText,
    bodyHtml: bodyHtml,
    parcours: parcours,
  });
  window.MedLexContractGuided.initViewToggle();
}

function updatePageChrome(parcours) {
  var docEl = document.getElementById('contract-doc');
  if (docEl) {
    var label =
      parcours === 'collaboration'
        ? 'Aperçu du contrat de collaboration'
        : parcours === 'fin-de-bail'
          ? 'Aperçu du courrier de fin de bail'
          : parcours === 'mise-en-demeure'
            ? 'Aperçu de la mise en demeure'
            : parcours === 'bail-professionnel'
              ? 'Aperçu du bail professionnel'
              : 'Aperçu du contrat de remplacement';
    docEl.setAttribute('aria-label', label);
  }
  var pageTitle = document.querySelector('.ac-title--page');
  if (pageTitle && (parcours === 'fin-de-bail' || parcours === 'mise-en-demeure')) {
    pageTitle.textContent = 'Ton courrier';
  }
  if (pageTitle && parcours === 'bail-professionnel') {
    pageTitle.textContent = 'Ton bail';
  }
  var micro = document.querySelector('.ac-main > .ac-microcopy');
  if (micro && (parcours === 'fin-de-bail' || parcours === 'mise-en-demeure')) {
    micro.textContent =
      'Paiement confirmé — parcours le courrier, ou consulte le texte intégral avant la signature.';
  }
  if (micro && parcours === 'bail-professionnel') {
    micro.textContent =
      'Paiement confirmé — parcours le bail section par section, ou consulte le texte intégral avant la signature.';
  }
}

var pdfExportModule = null;
var pdfPreloadPromise = null;

function preloadPdfEngine() {
  if (pdfPreloadPromise) {
    return pdfPreloadPromise;
  }
  console.log('[MedLex PDF]', 'contrat-page : démarrage préchargement…');
  pdfPreloadPromise = import('./contract/pdf-export.js')
    .then(function (mod) {
      console.log('[MedLex PDF]', 'contrat-page : module pdf-export importé');
      pdfExportModule = mod;
      return mod.preloadPdfEngine();
    })
    .then(function () {
      console.log('[MedLex PDF]', 'contrat-page : préchargement terminé', {
        pret: pdfExportModule && pdfExportModule.isPdfEngineReady(),
      });
    })
    .catch(function (e) {
      pdfPreloadPromise = null;
      console.error('[MedLex PDF]', 'contrat-page : échec préchargement', e);
      throw e;
    });
  return pdfPreloadPromise;
}

function wirePdfDownload(pdfBtn, docEl, filename, pdfMeta) {
  if (!pdfBtn || !docEl) return;

  var meta = pdfMeta || {};

  var labelReady = 'Télécharger le PDF';
  pdfBtn.disabled = true;
  pdfBtn.textContent = 'Préparation du PDF…';

  preloadPdfEngine()
    .then(function () {
      pdfBtn.disabled = false;
      pdfBtn.textContent = labelReady;
    })
    .catch(function () {
      pdfBtn.disabled = false;
      pdfBtn.textContent = labelReady;
    });

  pdfBtn.addEventListener('click', function () {
    var prev = pdfBtn.textContent;
    pdfBtn.disabled = true;
    pdfBtn.textContent = 'Téléchargement…';
    console.log('[MedLex PDF]', 'contrat-page : clic bouton', {
      filename: filename,
      moduleCharge: Boolean(pdfExportModule),
      pret: pdfExportModule ? pdfExportModule.isPdfEngineReady() : false,
      contractDoc: Boolean(docEl && docEl.querySelector('.ac-contract-doc__body')),
    });

    function runDownload() {
      pdfExportModule.downloadContractPdfNow({
        filename: filename,
        sourceElement: docEl,
        bodyText: meta.bodyText,
        parcours: meta.parcours,
      });
    }

    function resetBtn() {
      pdfBtn.disabled = false;
      pdfBtn.textContent = prev || labelReady;
    }

    if (pdfExportModule && pdfExportModule.isPdfEngineReady()) {
      try {
        runDownload();
      } catch (e) {
        console.error('[MedLex PDF]', 'contrat-page : erreur au clic', e);
        alert(
          e instanceof Error
            ? 'Impossible de générer le PDF : ' + e.message
            : 'Impossible de générer le PDF.'
        );
      } finally {
        resetBtn();
      }
      return;
    }

    (pdfExportModule ? pdfExportModule.ensurePdfEngineReady() : preloadPdfEngine())
      .then(function () {
        if (!pdfExportModule) {
          throw new Error('Module PDF non chargé.');
        }
        runDownload();
      })
      .catch(function (e) {
        console.error('[MedLex PDF]', 'contrat-page : erreur au clic', e);
        alert(
          e instanceof Error
            ? 'Impossible de générer le PDF : ' + e.message
            : 'Impossible de générer le PDF.'
        );
      })
      .finally(resetBtn);
  });
}

async function initCollaborationContrat(docEl, pdfBtn) {
  var qHref = 'questionnaire-collaboration.html';

  var snap =
    window.ParcoursCollaborationSnapshot && window.ParcoursCollaborationSnapshot.load();
  if (!snap) {
    showError(
      'Aucune réponse au questionnaire n’a été trouvée. Complète le questionnaire pour générer ton contrat.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  if (!window.ParcoursCollaborationSnapshot.apply(snap)) {
    showError('Impossible de restaurer les réponses du questionnaire.', qHref);
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  try {
    await loadScript('../medlex-collaboration-template-embedded.js');
    await import('./contract/collaboration/medlex-collaboration-contract.js');
    var Contract = window.MedLexCollaborationContract;

    var templateRaw = await Contract.loadTemplate();
    var answers = Contract.collectAnswers();
    var bodyText = Contract.buildContractText(templateRaw, answers);
    var rendered = renderCollaborationContract(docEl, bodyText, answers, Contract);
    docEl.removeAttribute('aria-busy');
    mountGuidedContractView('collaboration', rendered.bodyText, rendered.bodyHtml);

    wirePdfDownload(pdfBtn, docEl, 'contrat-de-collaboration-medlex.pdf', {
      bodyText: rendered.bodyText,
      parcours: 'collaboration',
    });
  } catch (e) {
    console.error(e);
    showError(
      e instanceof Error
        ? 'Erreur lors de la génération : ' + e.message
        : 'Erreur lors de la génération du contrat.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
  }
}

async function initRemplacementContrat(docEl, pdfBtn) {
  var qHref = 'questionnaire.html';

  var snap = window.ParcoursSnapshot && window.ParcoursSnapshot.load();
  if (!snap) {
    showError(
      'Aucune réponse au questionnaire n’a été trouvée. Complète le questionnaire pour générer ton contrat.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  if (!window.ParcoursSnapshot.apply(snap)) {
    showError('Impossible de restaurer les réponses du questionnaire.', qHref);
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  try {
    await loadScript('../medlex-contract-template-embedded.js');
    var mod = await import('./contract/medlex-contract.js');
    var Contract = mod.default || window.MedLexContract;

    var templateRaw = await Contract.loadTemplate();
    var answers = Contract.collectAnswers();
    var bodyText = Contract.buildContractText(templateRaw, answers);
    var rendered = renderRemplacementContract(docEl, bodyText, answers, Contract);
    docEl.removeAttribute('aria-busy');
    mountGuidedContractView('remplacement', rendered.bodyText, rendered.bodyHtml);

    wirePdfDownload(pdfBtn, docEl, 'contrat-de-remplacement-medlex.pdf', {
      bodyText: rendered.bodyText,
      parcours: 'remplacement',
    });
  } catch (e) {
    console.error(e);
    showError(
      e instanceof Error
        ? 'Erreur lors de la génération : ' + e.message
        : 'Erreur lors de la génération du contrat.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
  }
}

async function initFinDeBailContrat(docEl, pdfBtn) {
  var qHref = 'questionnaire-fin-de-bail.html';

  var snap = window.ParcoursFinDeBailSnapshot && window.ParcoursFinDeBailSnapshot.load();
  if (!snap) {
    showError(
      'Aucune réponse au questionnaire n’a été trouvée. Complète le questionnaire pour générer ton courrier.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  if (!window.ParcoursFinDeBailSnapshot.apply(snap)) {
    showError('Impossible de restaurer les réponses du questionnaire.', qHref);
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  try {
    await loadScript('../medlex-fin-de-bail-templates-embedded.js');
    await import('./contract/fin-de-bail/medlex-fin-de-bail-contract.js');
    var Contract = window.MedLexFinDeBailContract;

    var answers = Contract.collectAnswers();
    var templateRaw = await Contract.loadTemplate(answers);
    var bodyText = Contract.buildContractText(templateRaw, answers);
    var rendered = renderFinDeBailContract(docEl, bodyText, answers, Contract);
    docEl.removeAttribute('aria-busy');
    mountGuidedContractView('fin-de-bail', rendered.bodyText, rendered.bodyHtml);

    wirePdfDownload(pdfBtn, docEl, Contract.PDF_FILENAME || 'conge-bail-professionnel-medlex.pdf', {
      bodyText: rendered.bodyText,
      parcours: 'fin-de-bail',
    });
  } catch (e) {
    console.error(e);
    showError(
      e instanceof Error
        ? 'Erreur lors de la génération : ' + e.message
        : 'Erreur lors de la génération du courrier.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
  }
}

async function initMiseEnDemeureContrat(docEl, pdfBtn) {
  var qHref = 'questionnaire-mise-en-demeure.html';

  var snap =
    window.ParcoursMiseEnDemeureSnapshot && window.ParcoursMiseEnDemeureSnapshot.load();
  if (!snap) {
    showError(
      'Aucune réponse au questionnaire n’a été trouvée. Complète le questionnaire pour générer ton courrier.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  if (!window.ParcoursMiseEnDemeureSnapshot.apply(snap)) {
    showError('Impossible de restaurer les réponses du questionnaire.', qHref);
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  try {
    await loadScript('../medlex-mise-en-demeure-template-embedded.js');
    await import('./contract/mise-en-demeure/medlex-mise-en-demeure-contract.js');
    var Contract = window.MedLexMiseEnDemeureContract;

    var answers = Contract.collectAnswers();
    var templateRaw = await Contract.loadTemplate();
    var bodyText = Contract.buildContractText(templateRaw, answers);
    var rendered = renderMiseEnDemeureContract(docEl, bodyText, answers, Contract);
    docEl.removeAttribute('aria-busy');
    mountGuidedContractView('mise-en-demeure', rendered.bodyText, rendered.bodyHtml);

    wirePdfDownload(
      pdfBtn,
      docEl,
      Contract.PDF_FILENAME || 'mise-en-demeure-bailleur-medlex.pdf',
      {
        bodyText: rendered.bodyText,
        parcours: 'mise-en-demeure',
      }
    );
  } catch (e) {
    console.error(e);
    showError(
      e instanceof Error
        ? 'Erreur lors de la génération : ' + e.message
        : 'Erreur lors de la génération du courrier.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
  }
}

async function initBailProfessionnelContrat(docEl, pdfBtn) {
  var qHref = 'questionnaire-bail-professionnel.html';

  var snap =
    window.ParcoursBailProfessionnelSnapshot && window.ParcoursBailProfessionnelSnapshot.load();
  if (!snap) {
    showError(
      'Aucune réponse au questionnaire n’a été trouvée. Complète le questionnaire pour générer ton bail.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  if (!window.ParcoursBailProfessionnelSnapshot.apply(snap)) {
    showError('Impossible de restaurer les réponses du questionnaire.', qHref);
    if (pdfBtn) pdfBtn.disabled = true;
    return;
  }

  try {
    await loadScript('../medlex-bail-professionnel-template-embedded.js');
    await import('./contract/bail-professionnel/medlex-bail-professionnel-contract.js');
    var Contract = window.MedLexBailProfessionnelContract;

    var answers = Contract.collectAnswers();
    var templateRaw = await Contract.loadTemplate();
    var bodyText = Contract.buildContractText(templateRaw, answers);
    var rendered = renderBailProfessionnelContract(docEl, bodyText, answers, Contract);
    docEl.removeAttribute('aria-busy');
    mountGuidedContractView('bail-professionnel', rendered.bodyText, rendered.bodyHtml);

    wirePdfDownload(
      pdfBtn,
      docEl,
      Contract.PDF_FILENAME || 'bail-professionnel-medlex.pdf',
      {
        bodyText: rendered.bodyText,
        parcours: 'bail-professionnel',
      }
    );
  } catch (e) {
    console.error(e);
    showError(
      e instanceof Error
        ? 'Erreur lors de la génération : ' + e.message
        : 'Erreur lors de la génération du bail.',
      qHref
    );
    if (pdfBtn) pdfBtn.disabled = true;
  }
}

async function initContratPage() {
  var docEl = document.getElementById('contract-doc');
  var pdfBtn = document.getElementById('download-pdf');
  if (!docEl) return;

  var parcours = (window.ParcoursType && window.ParcoursType.get()) || 'remplacement';
  updatePageChrome(parcours);

  if (parcours === 'collaboration') {
    await initCollaborationContrat(docEl, pdfBtn);
  } else if (parcours === 'fin-de-bail') {
    await initFinDeBailContrat(docEl, pdfBtn);
  } else if (parcours === 'mise-en-demeure') {
    await initMiseEnDemeureContrat(docEl, pdfBtn);
  } else if (parcours === 'bail-professionnel') {
    await initBailProfessionnelContrat(docEl, pdfBtn);
  } else {
    await initRemplacementContrat(docEl, pdfBtn);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContratPage);
} else {
  initContratPage();
}
