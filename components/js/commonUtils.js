const { app } = require('electron');
const path = require('path');
const fs = require('fs');

// In-memory store for state
let persistentState = {};

// State management functions
const setPersistentState = (key, value) => {
  persistentState[key] = value;
};

const getPersistentState = (key) => {
  return persistentState[key];
};

const removePersistentState = (key) => {
  delete persistentState[key];
};

// Ensure only one window is active at a time
const restrictSingleWindow = (window) => {
  window.on('blur', () => {
    window.focus();
  });
};

module.exports = {
  setPersistentState,
  getPersistentState,
  removePersistentState,
  restrictSingleWindow,
};
