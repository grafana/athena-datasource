import { DataQueryRequest, DataSourceInstanceSettings, dateTime } from '@grafana/data';
import * as runtime from '@grafana/runtime';
import { DatasourceWithAsyncBackend } from '@grafana/async-query-data';
import { AthenaDataSourceOptions, AthenaQuery, FormatOptions } from 'types';
import { of } from 'rxjs';

import { DataSource } from './datasource';

interface TestContext {
  instanceSettings: DataSourceInstanceSettings<AthenaDataSourceOptions>;
  ds: DataSource;
}

describe('AthenaDatasource', () => {
  const ctx: TestContext = {} as TestContext;
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
      jsonData: {
        defaultRegion: 'testRegion',
        catalog: 'testCatalog',
        database: 'testDatabase',
        workgroup: 'testWorkgroup',
      },
    } as unknown as DataSourceInstanceSettings<AthenaDataSourceOptions>;
    ctx.ds = new DataSource(ctx.instanceSettings);
    ctx.ds.getResource = jest.fn().mockImplementation((path: string) => {
      switch (path) {
        case 'regions':
          return Promise.resolve(setupRegionsResponse());
      }
      return Promise.resolve([]);
    });

    ctx.ds.postResource = jest.fn().mockImplementation((path: string) => {
      switch (path) {
        case 'catalogs':
          return Promise.resolve(setupCatalogsResponse());
        case 'databases':
          return Promise.resolve(setupDatabasesResponse());
        case 'tables':
          return Promise.resolve(setupTablesResponse());
        case 'columns':
          return Promise.resolve(setupColumnsResponse());
        case 'workgroupEngineVersion':
          return Promise.resolve(setupWorkgroupEngineVersionResponse());
      }
      return Promise.resolve([]);
    });
  });

  describe('When performing getRegions', () => {
    it('should return a list of regions', async () => {
      const response = setupRegionsResponse();
      const regionsResponse = await ctx.ds.getRegions();

      expect(regionsResponse).toHaveLength(response.length);
      expect(regionsResponse).toEqual(response);
    });
  });

  describe('When performing getCatalogs', () => {
    it('should return a list of catalogs', async () => {
      const response = setupCatalogsResponse();
      const catalogsResponse = await ctx.ds.getCatalogs(defaultQuery);

      expect(catalogsResponse).toHaveLength(response.length);
      expect(catalogsResponse).toEqual(response);
    });
  });

  describe('When performing getDatabases', () => {
    it('should return a list of databases', async () => {
      const response = setupDatabasesResponse();
      const databasesResponse = await ctx.ds.getDatabases(defaultQuery);

      expect(databasesResponse).toHaveLength(response.length);
      expect(databasesResponse).toEqual(response);
    });
  });

  describe('When performing getTables', () => {
    it('should return a list of tables', async () => {
      const response = setupTablesResponse();
      const tablesResponse = await ctx.ds.getTables(defaultQuery);

      expect(tablesResponse).toHaveLength(response.length);
      expect(tablesResponse).toEqual(response);
    });
  });

  describe('When performing getColumns', () => {
    it('should return a list of columns', async () => {
      const response = setupColumnsResponse();
      const columnsResponse = await ctx.ds.getColumns(defaultQuery);

      expect(columnsResponse).toHaveLength(response.length);
      expect(columnsResponse).toEqual(response);
    });
  });

  describe('isResultReuseSupported()', () => {
    it('should support result reuse if athena engine version is greater than or equal to 3', async () => {
      const workgroupEngineVersionResponse = await ctx.ds.isResultReuseSupported();
      expect(workgroupEngineVersionResponse).toBeTruthy();
    });

    it('should not support result reuse if athena engine version is 2', async () => {
      ctx.ds.postResource = jest.fn().mockResolvedValue('Athena engine version 2');

      const workgroupEngineVersionResponse = await ctx.ds.isResultReuseSupported();
      expect(workgroupEngineVersionResponse).toBeFalsy();
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

    it('should not add additional properties to the query', async () => {
      const request = { ...queryRequest, targets: [{ ...defaultQuery, column: undefined }] };
      const queries = ctx.ds.buildQuery(request, request.targets);

      expect(queries).toHaveLength(1);
      expect(queries[0]).toEqual({ ...defaultQuery, column: undefined });
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

  it('should not run query if query is empty', async () => {
    const mockedSuperQuery = jest
      .spyOn(DatasourceWithAsyncBackend.prototype, 'query')
      .mockImplementation(() => of({ data: [] }));

    const request = { ...queryRequest, targets: [{ ...defaultQuery, rawSQL: '' }] };
    ctx.ds.query(request);
    expect(mockedSuperQuery).toHaveBeenCalledWith({ ...request, targets: [] });
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

function setupWorkgroupEngineVersionResponse(version?: string) {
  return version || 'Athena engine version 3';
}
