/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { FtrProviderContext } from '../../../ftr_provider_context';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const PageObjects = getPageObjects([
    'visualize',
    'lens',
    'dashboard',
    'header',
    'timePicker',
    'common',
    'navigationalSearch',
  ]);
  const security = getService('security');
  const listingTable = getService('listingTable');
  const kibanaServer = getService('kibanaServer');
  const dashboardPanelActions = getService('dashboardPanelActions');

  describe('Lens error handling', () => {
    describe('Index Pattern missing', () => {
      before(async () => {
        await security.testUser.setRoles(
          ['global_discover_read', 'global_visualize_read', 'test_logstash_reader'],
          { skipBrowserRefresh: true }
        );
        // loading an object without reference fails, so we load data view + lens object and then unload data view
        await kibanaServer.importExport.load(
          'x-pack/test/functional/fixtures/kbn_archiver/lens/errors'
        );
        await kibanaServer.importExport.unload(
          'x-pack/test/functional/fixtures/kbn_archiver/lens/errors2'
        );
      });

      after(async () => {
        await security.testUser.restoreDefaults();
        await kibanaServer.importExport.unload(
          'x-pack/test/functional/fixtures/kbn_archiver/lens/errors'
        );
      });

      it('the warning is shown and user can fix the state', async () => {
        await PageObjects.visualize.gotoVisualizationLandingPage();
        await listingTable.searchForItemWithName('lnsMetricWithNonExistingDataView');
        await PageObjects.lens.clickVisualizeListItemTitle('lnsMetricWithNonExistingDataView');
        await PageObjects.lens.waitForMissingDataViewWarning();
        await PageObjects.lens.switchToVisualization('lnsDatatable');
        await PageObjects.lens.waitForMissingDataViewWarning();
        await PageObjects.lens.switchToVisualization('donut');
        await PageObjects.lens.waitForMissingDataViewWarning();
        await PageObjects.lens.switchToVisualization('line');
        await PageObjects.lens.waitForMissingDataViewWarning();
        await PageObjects.lens.openDimensionEditor('lnsXY_yDimensionPanel > lns-dimensionTrigger');
        await PageObjects.lens.closeDimensionEditor();
        await PageObjects.lens.dragDimensionToDimension({
          from: 'lnsXY_yDimensionPanel > lns-dimensionTrigger',
          to: 'lnsXY_yDimensionPanel > lns-empty-dimension',
        });
        await PageObjects.lens.switchFirstLayerIndexPattern('log*');
        await PageObjects.lens.waitForMissingDataViewWarningDisappear();
        await PageObjects.lens.waitForEmptyWorkspace();
      });

      it('works fine when the dataViews is missing for referenceLines and annotations', async () => {
        await PageObjects.visualize.gotoVisualizationLandingPage();
        await listingTable.searchForItemWithName(
          'lnsXYWithReferenceLinesAndAnnotationsWithNonExistingDataView'
        );
        await PageObjects.lens.clickVisualizeListItemTitle(
          'lnsXYWithReferenceLinesAndAnnotationsWithNonExistingDataView'
        );
        await PageObjects.lens.waitForMissingDataViewWarning();
      });
    });

    it('does not block render when missing fields', async () => {
      await kibanaServer.importExport.load(
        'x-pack/test/functional/fixtures/kbn_archiver/lens/missing_fields'
      );

      await PageObjects.common.navigateToApp('dashboard');
      await PageObjects.dashboard.loadSavedDashboard('Dashboard with missing field Lens');
      await PageObjects.lens.assertMessageListContains(
        'Field missing field was not found.',
        'error'
      );
      await PageObjects.lens.waitForVisualization('mtrVis');

      await PageObjects.dashboard.switchToEditMode();
      await dashboardPanelActions.editPanelByTitle();
      await PageObjects.lens.assertMessageListContains(
        'Field missing field was not found.',
        'error'
      );
      await PageObjects.lens.waitForVisualization('mtrVis');

      await kibanaServer.importExport.unload(
        'x-pack/test/functional/fixtures/kbn_archiver/lens/missing_fields'
      );
    });
  });
}
