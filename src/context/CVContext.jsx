import {
  createContext, useContext, useReducer, useEffect, useCallback, useRef, useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import initialCVData from '@data/initialCVData';
import { migrateCV } from '@data/migrateCV';

// ─── Action types ────────────────────────────────────────────────────────────
export const CV_ACTIONS = {
  UPDATE_PERSONAL_INFO:  'UPDATE_PERSONAL_INFO',
  UPDATE_META:           'UPDATE_META',
  ADD_ITEM:              'ADD_ITEM',
  UPDATE_ITEM:           'UPDATE_ITEM',
  REMOVE_ITEM:           'REMOVE_ITEM',
  REORDER_ITEMS:         'REORDER_ITEMS',
  RESET_CV:              'RESET_CV',
  LOAD_CV:               'LOAD_CV',
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function cvReducer(state, action) {
  switch (action.type) {
    case CV_ACTIONS.UPDATE_PERSONAL_INFO:
      return {
        ...state,
        personalInfo: { ...state.personalInfo, ...action.payload },
      };

    case CV_ACTIONS.UPDATE_META:
      return {
        ...state,
        meta: { ...state.meta, ...action.payload },
      };

    case CV_ACTIONS.ADD_ITEM: {
      const { section, item } = action.payload;
      return {
        ...state,
        [section]: [...state[section], { id: uuidv4(), ...item }],
      };
    }

    case CV_ACTIONS.UPDATE_ITEM: {
      const { section, id, data } = action.payload;
      return {
        ...state,
        [section]: state[section].map((item) =>
          item.id === id ? { ...item, ...data } : item
        ),
      };
    }

    case CV_ACTIONS.REMOVE_ITEM: {
      const { section, id } = action.payload;
      return {
        ...state,
        [section]: state[section].filter((item) => item.id !== id),
      };
    }

    case CV_ACTIONS.REORDER_ITEMS: {
      const { section, sourceIndex, destinationIndex } = action.payload;
      const items = Array.from(state[section]);
      const [removed] = items.splice(sourceIndex, 1);
      items.splice(destinationIndex, 0, removed);
      return { ...state, [section]: items };
    }

    case CV_ACTIONS.RESET_CV:
      return migrateCV(initialCVData);

    case CV_ACTIONS.LOAD_CV: {
      // Un CV importé sans design (import PDF par IA) conserve le design actuel.
      const payload = action.payload || {};
      return migrateCV({ ...payload, meta: payload.meta || state.meta });
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const CVContext = createContext(null);

const STORAGE_KEY = 'profila_cv_data';
const MAX_SNAPSHOTS = 20;

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return migrateCV(raw ? JSON.parse(raw) : initialCVData);
  } catch {
    return migrateCV(initialCVData);
  }
}

export function CVProvider({ children }) {
  const [cvData, dispatch] = useReducer(cvReducer, undefined, loadSaved);
  // Points de restauration (en mémoire) avant chaque modification « en bloc » :
  // import, application des suggestions IA, réinitialisation.
  const [snapshots, setSnapshots] = useState([]);
  const cvRef = useRef(cvData);
  cvRef.current = cvData;

  // Auto-save to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
    } catch {
      // Storage full or unavailable-silently ignore
    }
  }, [cvData]);

  // ─── Action helpers ───────────────────────────────────────────────────────
  const updatePersonalInfo = useCallback((data) =>
    dispatch({ type: CV_ACTIONS.UPDATE_PERSONAL_INFO, payload: data }), []);

  const updateMeta = useCallback((data) =>
    dispatch({ type: CV_ACTIONS.UPDATE_META, payload: data }), []);

  const addItem = useCallback((section, item) =>
    dispatch({ type: CV_ACTIONS.ADD_ITEM, payload: { section, item } }), []);

  const updateItem = useCallback((section, id, data) =>
    dispatch({ type: CV_ACTIONS.UPDATE_ITEM, payload: { section, id, data } }), []);

  const removeItem = useCallback((section, id) =>
    dispatch({ type: CV_ACTIONS.REMOVE_ITEM, payload: { section, id } }), []);

  const reorderItems = useCallback((section, sourceIndex, destinationIndex) =>
    dispatch({ type: CV_ACTIONS.REORDER_ITEMS, payload: { section, sourceIndex, destinationIndex } }), []);

  const checkpoint = useCallback((label) => {
    const data = cvRef.current;
    setSnapshots((prev) => [...prev.slice(-(MAX_SNAPSHOTS - 1)), { label, data, at: Date.now() }]);
  }, []);

  const resetCV = useCallback(() => {
    checkpoint('Réinitialisation du CV');
    dispatch({ type: CV_ACTIONS.RESET_CV });
  }, [checkpoint]);

  // Remplace le CV entier ; un point de restauration est créé si `label` est fourni.
  const loadCV = useCallback((data, label) => {
    if (label) checkpoint(label);
    dispatch({ type: CV_ACTIONS.LOAD_CV, payload: data });
  }, [checkpoint]);

  const undo = useCallback(() => {
    if (!snapshots.length) return;
    dispatch({ type: CV_ACTIONS.LOAD_CV, payload: snapshots[snapshots.length - 1].data });
    setSnapshots(snapshots.slice(0, -1));
  }, [snapshots]);

  // Écriture explicite dans le navigateur (le CV est déjà auto-sauvegardé en
  // continu ; ce helper sert au bouton « Sauvegarder » pour une confirmation).
  const saveCV = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
      return true;
    } catch {
      return false;
    }
  }, [cvData]);

  const value = {
    cvData,
    updatePersonalInfo,
    updateMeta,
    addItem,
    updateItem,
    removeItem,
    reorderItems,
    resetCV,
    loadCV,
    saveCV,
    undo,
    canUndo: snapshots.length > 0,
    lastChangeLabel: snapshots[snapshots.length - 1]?.label || '',
  };

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
}

// ─── Consumer hook ────────────────────────────────────────────────────────────
export function useCV() {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error('useCV must be used inside <CVProvider>');
  return ctx;
}
