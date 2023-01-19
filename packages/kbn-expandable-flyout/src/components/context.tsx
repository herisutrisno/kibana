/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { noop } from 'lodash/fp';
import type { FlyoutLayout } from '../models/layout';
import type { FlyoutPanel } from '../models/panel';
import { FlyoutState, initialFlyoutState } from '../models/state';
import {
  closeFlyout,
  closeFlyoutLeftPanel,
  closeFlyoutPreviewPanel,
  closeFlyoutRightPanel,
  openFlyout,
  openFlyoutLeftPanel,
  openFlyoutPreviewPanel,
  openFlyoutRightPanel,
  previousFlyoutPreviewPanel,
  selectFlyoutLayout,
} from '../utils/helpers';

export interface ExpandableFlyoutContext {
  /**
   * Right, left and preview panels
   */
  panels: FlyoutLayout;
  /**
   * Open the flyout with left, right and/or preview panels
   */
  openFlyout: (panels: { left?: FlyoutPanel; right?: FlyoutPanel; preview?: FlyoutPanel }) => void;
  /**
   * Replaces the current right panel with a new one
   */
  openRightPanel: (panel: FlyoutPanel) => void;
  /**
   * Replaces the current left panel with a new one
   */
  openLeftPanel: (panel: FlyoutPanel) => void;
  /**
   * Add a new preview panel to the list of current preview panels
   */
  openPreviewPanel: (panel: FlyoutPanel) => void;
  /**
   * Closes right panel
   */
  closeRightPanel: () => void;
  /**
   * Closes left panel
   */
  closeLeftPanel: () => void;
  /**
   * Closes all preview panels
   */
  closePreviewPanel: () => void;
  /**
   * Go back to previous preview panel
   */
  previousPreviewPanel: () => void;
  /**
   * Close all panels and closes flyout
   */
  closeFlyout: () => void;
}

export const ExpandableFlyoutContext = createContext<ExpandableFlyoutContext>({
  panels: {
    left: {},
    right: {},
    preview: [],
  },
  openFlyout: noop,
  openRightPanel: noop,
  openLeftPanel: noop,
  openPreviewPanel: noop,
  closeRightPanel: noop,
  closeLeftPanel: noop,
  closePreviewPanel: noop,
  closeFlyout: noop,
  previousPreviewPanel: noop,
});

export interface ExpandableFlyoutProviderProps {
  /**
   * React children
   */
  children: React.ReactNode;
}

/**
 * Wrap your plugin with this context for the ExpandableFlyout React component.
 */
export const ExpandableFlyoutProvider = ({ children }: ExpandableFlyoutProviderProps) => {
  const [state, setState] = useState<FlyoutState>(initialFlyoutState);

  const openPanels = useCallback(
    ({
      right,
      left,
      preview,
    }: {
      right?: FlyoutPanel;
      left?: FlyoutPanel;
      preview?: FlyoutPanel;
    }) => setState(openFlyout(state, { left, right, preview })),
    [state]
  );

  const openRightPanel = useCallback(
    (panel: FlyoutPanel) => setState(openFlyoutRightPanel(state, panel)),
    [state]
  );

  const openLeftPanel = useCallback(
    (panel: FlyoutPanel) => setState(openFlyoutLeftPanel(state, panel)),
    [state]
  );

  const openPreviewPanel = useCallback(
    (panel: FlyoutPanel) => setState(openFlyoutPreviewPanel(state, panel)),
    [state]
  );

  const closeRightPanel = useCallback(() => setState(closeFlyoutRightPanel(state)), [state]);

  const closeLeftPanel = useCallback(() => setState(closeFlyoutLeftPanel(state)), [state]);

  const closePreviewPanel = useCallback(() => setState(closeFlyoutPreviewPanel(state)), [state]);

  const previousPreviewPanel = useCallback(
    () => setState(previousFlyoutPreviewPanel(state)),
    [state]
  );

  const closePanels = useCallback(() => setState(closeFlyout()), []);

  const contextValue = useMemo(
    () => ({
      panels: selectFlyoutLayout(state),
      openFlyout: openPanels,
      openRightPanel,
      openLeftPanel,
      openPreviewPanel,
      closeRightPanel,
      closeLeftPanel,
      closePreviewPanel,
      closeFlyout: closePanels,
      previousPreviewPanel,
    }),
    [
      state,
      openPanels,
      openRightPanel,
      openLeftPanel,
      openPreviewPanel,
      closeRightPanel,
      closeLeftPanel,
      closePreviewPanel,
      closePanels,
      previousPreviewPanel,
    ]
  );

  return (
    <ExpandableFlyoutContext.Provider value={contextValue}>
      {children}
    </ExpandableFlyoutContext.Provider>
  );
};

/**
 * Retrieve context's properties
 */
export const useExpandableFlyoutContext = () =>
  useContext<NonNullable<ExpandableFlyoutContext>>(ExpandableFlyoutContext);
