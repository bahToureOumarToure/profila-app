// Instance unique de pdf.js (worker configuré une fois) : extraction de texte
// des CV importés et rendu de l'aperçu PDF en canvas.
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export default pdfjsLib;
