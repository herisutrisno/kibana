/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { cloneDeep, intersection } from 'lodash';
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { SUMMARY_FILTER } from '../../common/constants/client_defaults';
import { UptimeEsClient } from '../legacy_uptime/lib/lib';
import {
  OverviewStatus,
  OverviewStatusMetaData,
  OverviewPendingStatusMetaData,
  Ping,
} from '../../common/runtime_types';

const DEFAULT_MAX_ES_BUCKET_SIZE = 10000;

export async function queryMonitorStatus(
  esClient: UptimeEsClient,
  listOfLocations: string[],
  range: { from: string | number; to: string },
  monitorQueryIds: string[],
  monitorLocationsMap: Record<string, string[]>,
  monitorQueryIdToConfigIdMap: Record<string, string>
): Promise<
  Omit<
    OverviewStatus,
    | 'disabledCount'
    | 'allMonitorsCount'
    | 'disabledMonitorsCount'
    | 'projectMonitorsCount'
    | 'allIds'
  >
> {
  const idSize = Math.trunc(DEFAULT_MAX_ES_BUCKET_SIZE / listOfLocations.length || 1);
  const pageCount = Math.ceil(monitorQueryIds.length / idSize);
  const promises: Array<Promise<any>> = [];
  const monitorsWithoutData = new Map(Object.entries(cloneDeep(monitorLocationsMap)));
  for (let i = 0; i < pageCount; i++) {
    const params: SearchRequest = {
      size: 0,
      query: {
        bool: {
          filter: [
            SUMMARY_FILTER,
            {
              range: {
                '@timestamp': {
                  // @ts-ignore
                  gte: range.from,
                  // @ts-expect-error can't mix number and string in client definition
                  lte: range.to,
                },
              },
            },
            {
              terms: {
                'monitor.id': (monitorQueryIds as string[]).slice(i * idSize, i * idSize + idSize),
              },
            },
            ...(listOfLocations.length > 0
              ? [
                  {
                    terms: {
                      'observer.geo.name': listOfLocations,
                    },
                  },
                ]
              : []),
          ],
        },
      },
      aggs: {
        id: {
          terms: {
            field: 'monitor.id',
            size: idSize,
          },
          aggs: {
            location: {
              terms: {
                field: 'observer.geo.name',
                size: listOfLocations.length || 100,
              },
              aggs: {
                status: {
                  top_hits: {
                    size: 1,
                    sort: [
                      {
                        '@timestamp': {
                          order: 'desc',
                        },
                      },
                    ],
                    _source: {
                      includes: [
                        '@timestamp',
                        'summary',
                        'monitor',
                        'observer',
                        'config_id',
                        'error',
                        'agent',
                        'url',
                        'state',
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    promises.push(esClient.search({ body: params }, 'getCurrentStatusOverview' + i));
  }
  let up = 0;
  let down = 0;
  let pending = 0;
  const upConfigs: Record<string, OverviewStatusMetaData> = {};
  const downConfigs: Record<string, OverviewStatusMetaData> = {};
  const pendingConfigs: Record<string, OverviewPendingStatusMetaData> = {};

  for await (const response of promises) {
    response.body.aggregations?.id.buckets.forEach(
      ({ location, key: queryId }: { location: any; key: string }) => {
        const locationSummaries = location.buckets.map(
          ({ status, key: locationName }: { key: string; status: any }) => {
            const ping = status.hits.hits[0]._source as Ping & { '@timestamp': string };
            return { location: locationName, ping };
          }
        ) as Array<{ location: string; ping: Ping & { '@timestamp': string } }>;

        // discard any locations that are not in the monitorLocationsMap for the given monitor as well as those which are
        // in monitorLocationsMap but not in listOfLocations
        const monLocations = monitorLocationsMap?.[queryId];
        const monQueriedLocations = intersection(monLocations, listOfLocations);
        monQueriedLocations?.forEach((monLocation) => {
          const locationSummary = locationSummaries.find(
            (summary) => summary.location === monLocation
          );

          if (locationSummary) {
            const { ping } = locationSummary;
            const downCount = ping.summary?.down ?? 0;
            const upCount = ping.summary?.up ?? 0;
            const configId = ping.config_id!;
            const monitorQueryId = ping.monitor.id;

            const meta = {
              ping,
              configId,
              monitorQueryId,
              location: monLocation,
              timestamp: ping['@timestamp'],
            };

            if (downCount > 0) {
              down += 1;
              downConfigs[`${configId}-${monLocation}`] = {
                ...meta,
                status: 'down',
              };
            } else if (upCount > 0) {
              up += 1;
              upConfigs[`${configId}-${monLocation}`] = {
                ...meta,
                status: 'up',
              };
            }
            const monitorsMissingData = monitorsWithoutData.get(monitorQueryId) || [];
            monitorsWithoutData.set(
              monitorQueryId,
              monitorsMissingData?.filter((loc) => loc !== monLocation)
            );
            if (!monitorsWithoutData.get(monitorQueryId)?.length) {
              monitorsWithoutData.delete(monitorQueryId);
            }
          } else {
            pending += 1;
          }
        });
      }
    );
  }

  // identify the remaining monitos without data, to determine pending monitors
  for (const [queryId, locs] of monitorsWithoutData) {
    locs.forEach((loc) => {
      pendingConfigs[`${monitorQueryIdToConfigIdMap[queryId]}-${loc}`] = {
        configId: `${monitorQueryIdToConfigIdMap[queryId]}`,
        monitorQueryId: queryId,
        status: 'unknown',
        location: loc,
      };
    });
  }

  return {
    up,
    down,
    pending,
    upConfigs,
    downConfigs,
    pendingConfigs,
    enabledMonitorQueryIds: monitorQueryIds,
  };
}
