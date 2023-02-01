/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { FlyoutPanel } from '@kbn/expandable-flyout';

export interface RightPanel extends FlyoutPanel {
  id: 'right';
}
export interface Right2Panel extends FlyoutPanel {
  id: 'right2';
}

export interface LeftPanel extends FlyoutPanel {
  id: 'left';
}

export interface Left2Panel extends FlyoutPanel {
  id: 'left2';
}

export interface PreviewPanel extends FlyoutPanel {
  id: 'preview';
}

export interface Preview2Panel extends FlyoutPanel {
  id: 'preview2';
}
