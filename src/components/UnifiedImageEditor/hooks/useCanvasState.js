import { useState, useCallback, useRef } from 'react';

const useCanvasState = (store) => {
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const initialState = useRef(null);

  const saveState = useCallback(() => {
    const state = store.toJSON();
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(state);
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, [store, historyIndex]);

  const loadState = useCallback((state) => {
    store.loadJSON(state);
  }, [store]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      loadState(history[newIndex]);
    }
  }, [history, historyIndex, loadState]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      loadState(history[newIndex]);
    }
  }, [history, historyIndex, loadState]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Initialize with current state
  useState(() => {
    initialState.current = store.toJSON();
    setHistory([initialState.current]);
    setHistoryIndex(0);
  }, []);

  return {
    saveState,
    loadState,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    historyIndex
  };
};

export { useCanvasState };