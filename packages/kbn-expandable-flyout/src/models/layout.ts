/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { FlyoutPanel } from './panel';

export interface FlyoutLayout {
  /**
   * Panel displayed in the left section of the flyout
   */
  left: FlyoutPanel | Record<string | number, never>;
  /**
   * Panel displayed in the right section of the flyout
   */
  right: FlyoutPanel | Record<string | number, never>;
  /**
   * Panels displayed in the preview section of the flyout
   */
  preview: FlyoutPanel[];
}
