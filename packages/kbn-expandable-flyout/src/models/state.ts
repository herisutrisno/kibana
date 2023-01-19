/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { FlyoutPanel } from '../..';

export interface FlyoutState {
  /**
   * Object storing all the panels with the panel id being the key
   */
  byId: { [panelId: string]: FlyoutPanel };
  /**
   * Left panel id
   */
  leftId: string | undefined;
  /**
   * Right panel id
   */
  rightId: string | undefined;
  /**
   * Preview panel ids
   */
  previewIds: string[];
  /**
   * All panel ids
   */
  allIds: string[];
}

export const initialFlyoutState: FlyoutState = {
  byId: {},
  leftId: undefined,
  rightId: undefined,
  previewIds: [],
  allIds: [],
};
