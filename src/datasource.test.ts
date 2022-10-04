import { DataQueryRequest, DataSourceInstanceSettings, dateTime } from '@grafana/data';
import * as runtime from '@grafana/runtime';
import { AthenaDataSourceOptions, AthenaQuery, FormatOptions } from 'types';

import { DataSource } from './datasource';

interface TestContext {
  instanceSettings: DataSourceInstanceSettings<AthenaDataSourceOptions>;
  ds: DataSource;
}

describe('AthenaDatasource', () => {
  const ctx: TestContext = {} as TestContext;
  const backendSrv = {
    get: (url: string, params?: any, requestId?: string) => {},
    post: (url: string, data?: any) => {},
  };

  const mockGetVariables = jest.fn().mockReturnValue([]);

  jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
    getVariables: mockGetVariables,
    replace: jest.fn(),
    containsTemplate: jest.fn(),
    updateTimeRange: jest.fn(),
  }));

  const defaultQuery: AthenaQuery = {
    connectionArgs: {
      region: 'defaultRegion',
      catalog: 'defaultCatalog',
      database: 'defaultDatabase',
    },
    table: 'defaultTable',
    column: 'defaultColumn',
    refId: 'testQuery',
    rawSQL: '',
    format: FormatOptions.TimeSeries,
  };
  const start = dateTime(new Date());
  const timeRange = { from: start, to: start.add(3600 * 1000, 'millisecond') };
  const rawTimeRange = { from: timeRange.from.toString(), to: timeRange.to.toString() };
  const queryRequest: DataQueryRequest<AthenaQuery> = {
    ...defaultQuery,
    range: { ...timeRange, raw: rawTimeRange },
    requestId: 'testRequest',
    interval: '1000',
    intervalMs: 1000,
    scopedVars: {},
    startTime: start.valueOf(),
    timezone: 'TZ',
    targets: [defaultQuery],
    app: 'athena',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    ctx.instanceSettings = {
      name: 'testAthena',
      jsonData: { defaultRegion: 'testRegion', catalog: 'testCatalog', database: 'testDatabase' },
    } as unknown as DataSourceInstanceSettings<AthenaDataSourceOptions>;
    ctx.ds = new DataSource(ctx.instanceSettings);
    runtime.setBackendSrv(backendSrv as runtime.BackendSrv);
  });

  describe('When performing getRegions', () => {
    it('should return a list of regions', async () => {
      const response = setupRegionsResponse();
      backendSrv.get = jest.fn(() => Promise.resolve(response));
      const regionsResponse = await ctx.ds.getRegions();

      expect(regionsResponse).toHaveLength(response.length);
      expect(regionsResponse).toBe(response);
    });
  });

  describe('When performing getCatalogs', () => {
    it('should return a list of catalogs', async () => {
      const response = setupCatalogsResponse();
      backendSrv.post = jest.fn(() => Promise.resolve(response));
      const catalogsResponse = await ctx.ds.getCatalogs(defaultQuery);

      expect(catalogsResponse).toHaveLength(response.length);
      expect(catalogsResponse).toBe(response);
    });
  });

  describe('When performing getDatabases', () => {
    it('should return a list of databases', async () => {
      const response = setupDatabasesResponse();
      backendSrv.post = jest.fn(() => Promise.resolve(response));
      const databasesResponse = await ctx.ds.getDatabases(defaultQuery);

      expect(databasesResponse).toHaveLength(response.length);
      expect(databasesResponse).toBe(response);
    });
  });

  describe('When performing getTables', () => {
    it('should return a list of tables', async () => {
      const response = setupTablesResponse();
      backendSrv.post = jest.fn(() => Promise.resolve(response));
      const tablesResponse = await ctx.ds.getTables(defaultQuery);

      expect(tablesResponse).toHaveLength(response.length);
      expect(tablesResponse).toBe(response);
    });
  });

  describe('When performing getColumns', () => {
    it('should return a list of columns', async () => {
      const response = setupColumnsResponse();
      backendSrv.post = jest.fn(() => Promise.resolve(response));
      const columnsResponse = await ctx.ds.getColumns(defaultQuery);

      expect(columnsResponse).toHaveLength(response.length);
      expect(columnsResponse).toBe(response);
    });
  });

  describe('When building queries', () => {
    jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
      getVariables: mockGetVariables,
      replace: (target: string) => target.replace('$testVar', 'replaced'),
      containsTemplate: jest.fn(),
      updateTimeRange: jest.fn(),
    }));

    it('should return query unchanged if there are no template variables', async () => {
      const queries = ctx.ds.buildQuery(queryRequest, queryRequest.targets);

      expect(queries).toHaveLength(1);
      expect(queries[0]).toBe(defaultQuery);
    });

    it('should return query with template variables replaced', async () => {
      queryRequest.targets = [
        {
          ...defaultQuery,
          connectionArgs: {
            ...defaultQuery.connectionArgs,
            region: '$testVar',
          },
        },
      ];
      const queries = ctx.ds.buildQuery(queryRequest, queryRequest.targets);
      expect(queries).toHaveLength(1);
      expect(queries[0].connectionArgs.region).toEqual('replaced');
    });
  });
});

function setupRegionsResponse() {
  return ['eu-north-1', 'eu-south-1', 'us-west-1', 'us-west-2'];
}

function setupCatalogsResponse() {
  return ['testCatalog1', 'testCatalog2'];
}

function setupDatabasesResponse() {
  return ['testDb1', 'testDb2'];
}

function setupTablesResponse() {
  return ['testTable1', 'testTable2'];
}

function setupColumnsResponse() {
  return ['testColumn1', 'testColumn2'];
}
