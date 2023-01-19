/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

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
} from './helpers';
import { FlyoutLayout, FlyoutPanel } from '../..';

const rightPanel1: FlyoutPanel = {
  id: 'right1',
  path: ['path'],
};
const leftPanel1: FlyoutPanel = {
  id: 'left1',
  params: { id: 'id' },
};
const previewPanel1: FlyoutPanel = {
  id: 'preview1',
  state: { id: 'state' },
};

const rightPanel2: FlyoutPanel = {
  id: 'right2',
  path: ['path'],
};
const leftPanel2: FlyoutPanel = {
  id: 'left2',
  params: { id: 'id' },
};
const previewPanel2: FlyoutPanel = {
  id: 'preview2',
  state: { id: 'state' },
};

describe('helpers', () => {
  describe('openFlyout', () => {
    it('should add panels to empty state', () => {
      const initialState: FlyoutState = initialFlyoutState;
      const payload = {
        right: rightPanel1,
        left: leftPanel1,
        preview: previewPanel1,
      };
      const newState: FlyoutState = openFlyout(initialState, payload);

      expect(newState).toEqual({
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id],
        allIds: [rightPanel1.id, leftPanel1.id, previewPanel1.id],
      });
    });

    it('should override all panels in the state', () => {
      const initialState: FlyoutState = {
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
          ['preview']: { id: 'abc' },
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id, 'preview'],
        allIds: [rightPanel1.id, leftPanel1.id, previewPanel1.id, 'preview'],
      };
      const payload = {
        right: rightPanel2,
        left: leftPanel2,
        preview: previewPanel2,
      };
      const newState: FlyoutState = openFlyout(initialState, payload);

      expect(newState).toEqual({
        byId: {
          [rightPanel2.id]: rightPanel2,
          [leftPanel2.id]: leftPanel2,
          [previewPanel2.id]: previewPanel2,
        },
        leftId: leftPanel2.id,
        rightId: rightPanel2.id,
        previewIds: [previewPanel2.id],
        allIds: [rightPanel2.id, leftPanel2.id, previewPanel2.id],
      });
    });

    it('should remove all panels despite only passing a single section ', () => {
      const initialState: FlyoutState = {
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel2,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id],
        allIds: [rightPanel1.id, leftPanel1.id, previewPanel1.id],
      };
      const payload = {
        right: rightPanel2,
      };
      const newState: FlyoutState = openFlyout(initialState, payload);

      expect(newState).toEqual({
        byId: { [rightPanel2.id]: rightPanel2 },
        leftId: undefined,
        rightId: rightPanel2.id,
        previewIds: [],
        allIds: [rightPanel2.id],
      });
    });
  });

  describe('openFlyoutRightPanel', () => {
    it('should add right panel to empty state', () => {
      const initialState: FlyoutState = initialFlyoutState;
      const payload: FlyoutPanel = rightPanel1;
      const newState: FlyoutState = openFlyoutRightPanel(initialState, payload);

      expect(newState).toEqual({
        byId: { [rightPanel1.id]: rightPanel1 },
        leftId: undefined,
        rightId: rightPanel1.id,
        previewIds: [],
        allIds: [rightPanel1.id],
      });
    });

    it('should replace right panel', () => {
      const initialState: FlyoutState = {
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id],
        allIds: [rightPanel1.id, leftPanel1.id, previewPanel1.id],
      };
      const payload: FlyoutPanel = rightPanel2;
      const newState: FlyoutState = openFlyoutRightPanel(initialState, payload);

      expect(newState).toEqual({
        byId: {
          [rightPanel2.id]: rightPanel2,
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel2.id,
        previewIds: [previewPanel1.id],
        allIds: [leftPanel1.id, previewPanel1.id, rightPanel2.id],
      });
    });
  });

  describe('openFlyoutLeftPanel', () => {
    it('should add left panel to empty state', () => {
      const initialState: FlyoutState = initialFlyoutState;
      const payload: FlyoutPanel = leftPanel1;
      const newState: FlyoutState = openFlyoutLeftPanel(initialState, payload);

      expect(newState).toEqual({
        byId: { [leftPanel1.id]: leftPanel1 },
        leftId: leftPanel1.id,
        rightId: undefined,
        previewIds: [],
        allIds: [leftPanel1.id],
      });
    });

    it('should replace only left panel', () => {
      const initialState: FlyoutState = {
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id],
        allIds: [rightPanel1.id, leftPanel1.id, previewPanel1.id],
      };
      const payload: FlyoutPanel = leftPanel2;
      const newState: FlyoutState = openFlyoutLeftPanel(initialState, payload);

      expect(newState).toEqual({
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel2.id]: leftPanel2,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: leftPanel2.id,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id],
        allIds: [rightPanel1.id, previewPanel1.id, leftPanel2.id],
      });
    });
  });

  describe('openFlyoutPreviewPanel', () => {
    it('should add preview panel to empty state', () => {
      const initialState: FlyoutState = initialFlyoutState;
      const payload: FlyoutPanel = previewPanel1;
      const newState: FlyoutState = openFlyoutPreviewPanel(initialState, payload);

      expect(newState).toEqual({
        byId: { [previewPanel1.id]: previewPanel1 },
        leftId: undefined,
        rightId: undefined,
        previewIds: [previewPanel1.id],
        allIds: [previewPanel1.id],
      });
    });

    it('should add preview panel to the list of preview panels', () => {
      const initialState: FlyoutState = {
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id],
        allIds: [rightPanel1.id, leftPanel1.id, previewPanel1.id],
      };
      const payload: FlyoutPanel = previewPanel2;
      const newState: FlyoutState = openFlyoutPreviewPanel(initialState, payload);

      expect(newState).toEqual({
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
          [previewPanel2.id]: previewPanel2,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id, previewPanel2.id],
        allIds: [rightPanel1.id, leftPanel1.id, previewPanel1.id, previewPanel2.id],
      });
    });
  });

  describe('closeFlyoutRightPanel', () => {
    it('should return empty state when removing right panel from empty state', () => {
      const initialState: FlyoutState = initialFlyoutState;
      const newState: FlyoutState = closeFlyoutRightPanel(initialState);

      expect(newState).toEqual(initialFlyoutState);
    });

    it(`should return unmodified state when removing right panel when no right panel exist`, () => {
      const initialState: FlyoutState = {
        byId: {
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: leftPanel1.id,
        rightId: undefined,
        previewIds: [previewPanel1.id],
        allIds: [leftPanel1.id, previewPanel1.id],
      };
      const newState: FlyoutState = closeFlyoutRightPanel(initialState);

      expect(newState).toEqual(initialState);
    });

    it('should remove right panel', () => {
      const initialState: FlyoutState = {
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id],
        allIds: [rightPanel1.id, leftPanel1.id, previewPanel1.id],
      };
      const newState: FlyoutState = closeFlyoutRightPanel(initialState);

      expect(newState).toEqual({
        byId: {
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: leftPanel1.id,
        rightId: undefined,
        previewIds: [previewPanel1.id],
        allIds: [leftPanel1.id, previewPanel1.id],
      });
    });
  });

  describe('closeFlyoutLeftPanel', () => {
    it('should return empty state when removing left panel on empty state', () => {
      const initialState: FlyoutState = initialFlyoutState;
      const newState: FlyoutState = closeFlyoutLeftPanel(initialState);

      expect(newState).toEqual(initialFlyoutState);
    });

    it(`should return unmodified state when removing left panel when no left panel exist`, () => {
      const initialState: FlyoutState = {
        byId: {
          [rightPanel1.id]: rightPanel1,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: undefined,
        rightId: rightPanel1.id,
        previewIds: [],
        allIds: [rightPanel1.id, previewPanel1.id],
      };
      const newState: FlyoutState = closeFlyoutLeftPanel(initialState);

      expect(newState).toEqual(initialState);
    });

    it('should remove left panel', () => {
      const initialState: FlyoutState = {
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id],
        allIds: [rightPanel1.id, leftPanel1.id, previewPanel1.id],
      };
      const newState: FlyoutState = closeFlyoutLeftPanel(initialState);

      expect(newState).toEqual({
        byId: {
          [rightPanel1.id]: rightPanel1,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: undefined,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id],
        allIds: [rightPanel1.id, previewPanel1.id],
      });
    });
  });

  describe('closeFlyoutPreviewPanel', () => {
    it('should return empty state when removing preview panel on empty state', () => {
      const initialState: FlyoutState = initialFlyoutState;
      const newState: FlyoutState = closeFlyoutPreviewPanel(initialState);

      expect(newState).toEqual(initialFlyoutState);
    });

    it(`should return unmodified state when removing preview panel when no preview panel exist`, () => {
      const initialState: FlyoutState = {
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [],
        allIds: [rightPanel1.id, leftPanel1.id],
      };
      const newState: FlyoutState = closeFlyoutPreviewPanel(initialState);

      expect(newState).toEqual(initialState);
    });

    it('should remove all preview panels', () => {
      const initialState: FlyoutState = {
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
          [previewPanel2.id]: previewPanel2,
        },
        leftId: rightPanel1.id,
        rightId: leftPanel1.id,
        previewIds: [previewPanel1.id, previewPanel2.id],
        allIds: [rightPanel1.id, leftPanel1.id, previewPanel1.id, previewPanel2.id],
      };
      const newState: FlyoutState = closeFlyoutPreviewPanel(initialState);

      expect(newState).toEqual({
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
        },
        leftId: rightPanel1.id,
        rightId: leftPanel1.id,
        previewIds: [],
        allIds: [rightPanel1.id, leftPanel1.id],
      });
    });
  });

  describe('previousFlyoutPreviewPanel', () => {
    it('should return empty state when previous preview panel on an empty state', () => {
      const initialState: FlyoutState = initialFlyoutState;
      const newState: FlyoutState = previousFlyoutPreviewPanel(initialState);

      expect(newState).toEqual(initialFlyoutState);
    });

    it(`should return unmodified state when previous preview panel when no preview panel exist`, () => {
      const initialState: FlyoutState = {
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [],
        allIds: [rightPanel1.id, leftPanel1.id],
      };
      const newState: FlyoutState = previousFlyoutPreviewPanel(initialState);

      expect(newState).toEqual(initialState);
    });

    it('should remove only last preview panel', () => {
      const initialState: FlyoutState = {
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
          [previewPanel2.id]: previewPanel2,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id, previewPanel2.id],
        allIds: [rightPanel1.id, leftPanel1.id, previewPanel1.id, previewPanel2.id],
      };
      const newState: FlyoutState = previousFlyoutPreviewPanel(initialState);

      expect(newState).toEqual({
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id],
        allIds: [rightPanel1.id, leftPanel1.id, previewPanel1.id],
      });
    });
  });

  describe('closeFlyout', () => {
    it('should return empty state when closing flyout on an empty state', () => {
      const newState: FlyoutState = closeFlyout();

      expect(newState).toEqual(initialFlyoutState);
    });

    it('should remove all panels', () => {
      const newState: FlyoutState = closeFlyout();

      expect(newState).toEqual({
        byId: {},
        leftId: undefined,
        rightId: undefined,
        previewIds: [],
        allIds: [],
      });
    });
  });

  describe('selectFlyoutLayout', () => {
    it(`should return empty layout if state is empty doesnt exist`, () => {
      const initialState: FlyoutState = initialFlyoutState;
      const newState: FlyoutLayout = selectFlyoutLayout(initialState);

      expect(newState).toEqual({
        right: {},
        left: {},
        preview: [],
      });
    });

    it(`should return layout`, () => {
      const initialState: FlyoutState = {
        byId: {
          [rightPanel1.id]: rightPanel1,
          [leftPanel1.id]: leftPanel1,
          [previewPanel1.id]: previewPanel1,
        },
        leftId: leftPanel1.id,
        rightId: rightPanel1.id,
        previewIds: [previewPanel1.id],
        allIds: [rightPanel1.id, leftPanel1.id, previewPanel1.id],
      };
      const newState: FlyoutLayout = selectFlyoutLayout(initialState);

      expect(newState).toEqual({
        right: rightPanel1,
        left: leftPanel1,
        preview: [previewPanel1],
      });
    });
  });
});
