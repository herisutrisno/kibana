/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { FlyoutLayout } from '../models/layout';
import { FlyoutPanel } from '../models/panel';
import { FlyoutState } from '../models/state';

/**
 * Open the flyout by removing all prior left, right and preview panel and replacing with new ones.
 *
 * @param {FlyoutState} state the previous state
 * @param payload optional left, right and/or preview panels
 * @return {FlyoutState}
 */
export const openFlyout = (
  state: FlyoutState,
  payload: {
    right?: FlyoutPanel;
    left?: FlyoutPanel;
    preview?: FlyoutPanel;
  }
): FlyoutState => {
  const { left, right, preview } = payload;

  const byId: { [panelId: string]: FlyoutPanel } = {};
  let rightId: string | undefined;
  let leftId: string | undefined;
  const previewIds: string[] = [];
  const allIds: string[] = [];

  if (right) {
    const { id } = right;
    byId[id] = right;
    rightId = id;
    allIds.push(id);
  }

  if (left) {
    const { id } = left;
    byId[id] = left;
    leftId = id;
    allIds.push(id);
  }

  if (preview) {
    const { id } = preview;
    byId[id] = preview;
    previewIds.push(id);
    allIds.push(id);
  }

  return { byId, leftId, rightId, previewIds, allIds };
};

/**
 * Opens a right section by replacing the previous right panel with the new one.
 *
 * @param {FlyoutState} state the previous state
 * @param {FlyoutPanel} payload the new right panel
 * @return {FlyoutState}
 */
export const openFlyoutRightPanel = (state: FlyoutState, payload: FlyoutPanel): FlyoutState => {
  const byId: { [panelId: string]: FlyoutPanel } = { ...state.byId };

  // delete previous right id
  if (state.rightId) {
    delete byId[state.rightId];
  }

  return {
    byId: { ...byId, [payload.id]: payload },
    leftId: state.leftId,
    rightId: payload.id,
    previewIds: state.previewIds,
    allIds: [...state.allIds.filter((id: string) => id !== state.rightId), payload.id],
  };
};

/**
 * Opens a left section by replacing the previous left panel with the new one.
 *
 * @param {FlyoutState} state the previous state
 * @param {FlyoutPanel} payload the new left panel
 * @return {FlyoutState}
 */
export const openFlyoutLeftPanel = (state: FlyoutState, payload: FlyoutPanel): FlyoutState => {
  const byId: { [panelId: string]: FlyoutPanel } = { ...state.byId };

  // delete previous left id
  if (state.leftId) {
    delete byId[state.leftId];
  }

  return {
    byId: { ...byId, [payload.id]: payload },
    leftId: payload.id,
    rightId: state.rightId,
    previewIds: state.previewIds,
    allIds: [...state.allIds.filter((id: string) => id !== state.leftId), payload.id],
  };
};

/**
 * Opens a preview section by adding to the array of preview panels.
 *
 * @param {FlyoutState} state the previous state
 * @param {FlyoutPanel} payload a new preview panel
 * @return {FlyoutState}
 */
export const openFlyoutPreviewPanel = (state: FlyoutState, payload: FlyoutPanel): FlyoutState => ({
  byId: { ...state.byId, [payload.id]: payload },
  leftId: state.leftId,
  rightId: state.rightId,
  previewIds: [...state.previewIds, payload.id],
  allIds: [...state.allIds, payload.id],
});

/**
 * Closes the right section by removing the right panel.
 *
 * @param {FlyoutState} state the previous state
 * @return {FlyoutState}
 */
export const closeFlyoutRightPanel = (state: FlyoutState): FlyoutState => {
  if (!state.rightId) {
    return state;
  }

  // delete previous right id
  const byId = { ...state.byId };
  delete byId[state.rightId];

  return {
    byId,
    leftId: state.leftId,
    rightId: undefined,
    previewIds: state.previewIds,
    allIds: state.allIds.filter((id: string) => id !== state.rightId),
  };
};

/**
 * Close the left section by  removing the left panel.
 *
 * @param {FlyoutState} state the previous state
 * @return {FlyoutState}
 */
export const closeFlyoutLeftPanel = (state: FlyoutState): FlyoutState => {
  if (!state.leftId) {
    return state;
  }

  // delete previous id
  const byId = { ...state.byId };
  delete byId[state.leftId];

  return {
    byId,
    leftId: undefined,
    rightId: state.rightId,
    previewIds: state.previewIds,
    allIds: state.allIds.filter((id: string) => id !== state.leftId),
  };
};

/**
 * Closes the preview section by removing emoves all the preview panels.
 *
 * @param {FlyoutState} state the previous state
 * @return {FlyoutState}
 */
export const closeFlyoutPreviewPanel = (state: FlyoutState): FlyoutState => {
  if (state.previewIds.length === 0) {
    return state;
  }

  // delete previous ids
  const byId = { ...state.byId };
  state.previewIds.forEach((id: string) => delete byId[id]);

  return {
    byId,
    leftId: state.leftId,
    rightId: state.rightId,
    previewIds: [],
    allIds: state.allIds.filter((id: string) => !state.previewIds.includes(id)),
  };
};

/**
 * Navigates to the previous preview panel by removing the last entry in the array of preview panels.
 *
 * @param {FlyoutState} state the previous state
 * @return {FlyoutState}
 */
export const previousFlyoutPreviewPanel = (state: FlyoutState): FlyoutState => {
  if (state.previewIds.length === 0) {
    return state;
  }

  // delete the most recent preview id
  const byId = { ...state.byId };
  const mostRecentId: string = state.previewIds[state.previewIds.length - 1];
  delete byId[mostRecentId];

  const previewIds = [...state.previewIds];
  previewIds.pop();

  const allIds = [...state.allIds];
  const index = allIds.indexOf(mostRecentId);
  if (index !== -1) {
    allIds.splice(index, 1);
  }

  return {
    byId,
    leftId: state.leftId,
    rightId: state.rightId,
    previewIds,
    allIds,
  };
};

/**
 * Close the flyout by removing all the panels.
 *
 * @return {FlyoutState}
 */
export const closeFlyout = (): FlyoutState => ({
  byId: {},
  leftId: undefined,
  rightId: undefined,
  previewIds: [],
  allIds: [],
});

/**
 * Retrieves the left, right and preview panels.
 *
 * @param {FlyoutState} state the previous state
 * @return {FlyoutLayout}
 */
export const selectFlyoutLayout = (state: FlyoutState): FlyoutLayout => ({
  left: state.leftId ? state.byId[state.leftId] : {},
  right: state.rightId ? state.byId[state.rightId] : {},
  preview: state.previewIds.map((id: string) => state.byId[id]),
});
