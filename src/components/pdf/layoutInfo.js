// Dernière mise en page connue (renseignée par l'aperçu) : permet à l'assistant
// de savoir combien de pages fait le CV sans régénérer le PDF.
let info = null;

export function setLayoutInfo(next) { info = next; }
export function getLayoutInfo() { return info; }
