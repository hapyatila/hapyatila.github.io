/**
 * Type de parcours contrat : remplacement, collaboration ou fin de bail.
 * Stocké en sessionStorage pour router vers le bon questionnaire.
 */
(function () {
  var STORAGE_KEY = "ac-parcours-type";
  var DEFAULT = "remplacement";
  var KNOWN = {
    remplacement: true,
    collaboration: true,
    "fin-de-bail": true,
  };

  function normalize(type) {
    return KNOWN[type] ? type : DEFAULT;
  }

  function set(type) {
    try {
      sessionStorage.setItem(STORAGE_KEY, normalize(type));
    } catch (e) {
      /* ignore */
    }
  }

  function get() {
    try {
      var v = sessionStorage.getItem(STORAGE_KEY);
      return v ? normalize(v) : DEFAULT;
    } catch (e) {
      return DEFAULT;
    }
  }

  function isCollaboration() {
    return get() === "collaboration";
  }

  function isFinDeBail() {
    return get() === "fin-de-bail";
  }

  function questionnaireUrl() {
    var t = get();
    if (t === "collaboration") return "questionnaire-collaboration.html";
    if (t === "fin-de-bail") return "questionnaire-fin-de-bail.html";
    return "questionnaire.html";
  }

  function label() {
    var t = get();
    if (t === "collaboration") return "Contrat de collaboration";
    if (t === "fin-de-bail") return "Fin de bail professionnel";
    return "Contrat de remplacement";
  }

  function labelShort() {
    var t = get();
    if (t === "collaboration") return "Collaboration";
    if (t === "fin-de-bail") return "Fin de bail";
    return "Remplacement";
  }

  function applyQuestionnaireLinks() {
    document.querySelectorAll("[data-ac-questionnaire-link]").forEach(function (el) {
      el.setAttribute("href", questionnaireUrl());
    });
  }

  function applyApercuBackLinks() {
    document.querySelectorAll("[data-ac-apercu-back]").forEach(function (el) {
      el.setAttribute("href", questionnaireUrl());
    });
  }

  function initFromQuery() {
    var params = new URLSearchParams(window.location.search);
    var type = params.get("type");
    if (KNOWN[type]) {
      set(type);
    }
  }

  window.ParcoursType = {
    STORAGE_KEY: STORAGE_KEY,
    set: set,
    get: get,
    isCollaboration: isCollaboration,
    isFinDeBail: isFinDeBail,
    questionnaireUrl: questionnaireUrl,
    label: label,
    labelShort: labelShort,
    applyQuestionnaireLinks: applyQuestionnaireLinks,
    applyApercuBackLinks: applyApercuBackLinks,
    initFromQuery: initFromQuery,
  };
})();
