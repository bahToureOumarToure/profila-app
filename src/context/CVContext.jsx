import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import initialCVData from '@data/initialCVData';

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
function cvReducer(state, action) {
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
      return initialCVData;

    case CV_ACTIONS.LOAD_CV:
      return { ...initialCVData, ...action.payload };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const CVContext = createContext(null);

const STORAGE_KEY = 'profila_cv_data';

export function CVProvider({ children }) {
  const savedData = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...initialCVData, ...JSON.parse(raw) } : initialCVData;
    } catch {
      return initialCVData;
    }
  })();

  const [cvData, dispatch] = useReducer(cvReducer, savedData);

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

  const resetCV = useCallback(() =>
    dispatch({ type: CV_ACTIONS.RESET_CV }), []);

  const loadCV = useCallback((data) =>
    dispatch({ type: CV_ACTIONS.LOAD_CV, payload: data }), []);

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
  };

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
}

// ─── Consumer hook ────────────────────────────────────────────────────────────
export function useCV() {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error('useCV must be used inside <CVProvider>');
  return ctx;
}
