/**
 * Rendu HTML du courrier de fin de bail.
 */

import { escapeHtml, escapeRegExp } from '../utils.js';

/** @param {Record<string, string|boolean>} a */
function collectHighlightValues(a) {
  const candidates = [
    a.identiteBailleur,
    a.adresseBailleur,
    a.representantBailleur,
    a.identitePreneur,
    a.adressePreneur,
    a.adresseLocaux,
    a.dateBail,
    a.dateEcheance,
  ];
  if (a.precisionLocal) {
    candidates.push(String(a.precisionLocal).replace(/^,\s*/, ''));
  }

  const values = [];
  for (const v of candidates) {
    const s = String(v || '').trim();
    if (!s || s === 'Non renseigné') continue;
    if (!values.includes(s)) values.push(s);
  }
  values.sort(function (x, y) {
    return y.length - x.length;
  });
  return values;
}

function highlightAnswerValuesInLine(line, values) {
  let out = escapeHtml(line);
  for (const v of values) {
    const esc = escapeHtml(v);
    out = out.replace(new RegExp(escapeRegExp(esc), 'g'), '<strong>' + esc + '</strong>');
  }
  return out;
}

/**
 * @param {string} bodyText
 * @param {Record<string, string|boolean>} a
 */
export function buildContractRenderedHtml(bodyText, a) {
  const highlightValues = collectHighlightValues(a);
  return bodyText
    .split('\n')
    .map(function (line) {
      return line.trim() === ''
        ? '<br />'
        : '<p style="margin:0 0 8px;line-height:1.5">' +
            highlightAnswerValuesInLine(line, highlightValues) +
            '</p>';
    })
    .join('');
}
