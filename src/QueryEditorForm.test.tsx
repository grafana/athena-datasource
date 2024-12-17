import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryEditorForm } from './QueryEditorForm';
import { mockDatasource, mockQuery } from './__mocks__/datasource';
import '@testing-library/jest-dom';
import { select } from 'react-select-event';
import { selectors } from 'tests/selectors';
import { defaultKey, defaultQuery, QueryEditorFieldType } from 'types';
import * as pluginUi from '@grafana/plugin-ui';

const ds = mockDatasource;
const q = mockQuery;

const mockGetVariables = jest.fn().mockReturnValue([]);

jest.spyOn(ds, 'getVariables').mockImplementation(mockGetVariables);

jest.mock('@grafana/plugin-ui', () => ({
  ...jest.requireActual<typeof pluginUi>('@grafana/plugin-ui'),
  SQLEditor: function SQLEditor() {
    return <></>;
  },
}));

const props = {
  datasource: ds,
  query: q,
  onChange: jest.fn(),
  onRunQuery: jest.fn(),
};

beforeEach(() => {
  ds.getResource = jest.fn().mockResolvedValue([]);
  ds.postResource = jest.fn().mockResolvedValue([]);
});

describe('QueryEditor', () => {
  it('should request regions and use a new one', async () => {
    const onChange = jest.fn();
    ds.getResource = jest.fn().mockResolvedValue([ds.defaultRegion, 'foo']);
    ds.getRegions = jest.fn(() => ds.getResource(QueryEditorFieldType.Regions));
    render(<QueryEditorForm {...props} onChange={onChange} />);

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.region.input);
    expect(selectEl).toBeInTheDocument();
    await userEvent.click(selectEl);

    await select(selectEl, 'foo', { container: document.body });

    expect(ds.getResource).toHaveBeenCalledWith(QueryEditorFieldType.Regions);
    expect(onChange).toHaveBeenCalledWith({
      ...q,
      connectionArgs: { ...q.connectionArgs, region: 'foo' },
    });
  });

  it('should request catalogs and use a new one', async () => {
    const onChange = jest.fn();
    ds.postResource = jest.fn().mockResolvedValue([ds.defaultCatalog, 'foo']);
    ds.getCatalogs = jest.fn((query) =>
      ds.postResource(QueryEditorFieldType.Catalogs, { region: query.connectionArgs.region })
    );
    render(<QueryEditorForm {...props} onChange={onChange} />);

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.catalog.input);
    expect(selectEl).toBeInTheDocument();
    await userEvent.click(selectEl);

    await select(selectEl, 'foo', { container: document.body });

    expect(ds.postResource).toHaveBeenCalledWith(QueryEditorFieldType.Catalogs, { region: defaultKey });
    expect(onChange).toHaveBeenCalledWith({
      ...q,
      connectionArgs: { ...q.connectionArgs, catalog: 'foo' },
    });
  });

  it('should request databases and not execute the query', async () => {
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    ds.postResource = jest.fn().mockResolvedValue([ds.defaultDatabase, 'foo']);
    ds.getDatabases = jest.fn((query) =>
      ds.postResource(QueryEditorFieldType.Databases, {
        region: query.connectionArgs.region,
        catalog: query.connectionArgs.catalog,
      })
    );
    render(<QueryEditorForm {...props} onChange={onChange} onRunQuery={onRunQuery} />);

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.database.input);
    expect(selectEl).toBeInTheDocument();
    await userEvent.click(selectEl);

    await select(selectEl, 'foo', { container: document.body });

    expect(ds.postResource).toHaveBeenCalledWith(QueryEditorFieldType.Databases, {
      region: defaultKey,
      catalog: defaultKey,
    });
    expect(onChange).toHaveBeenCalledWith({
      ...q,
      connectionArgs: { ...q.connectionArgs, database: 'foo' },
    });
    expect(onRunQuery).not.toHaveBeenCalled();
  });

  it('should request select tables and not execute the query', async () => {
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    ds.postResource = jest.fn().mockResolvedValue(['foo']);
    ds.getTables = jest.fn((query) =>
      ds.postResource(QueryEditorFieldType.Tables, {
        region: query.connectionArgs.region,
        catalog: query.connectionArgs.catalog,
        database: query.connectionArgs.database,
      })
    );
    render(<QueryEditorForm {...props} onChange={onChange} onRunQuery={onRunQuery} />);

    const selectEl = screen.getByLabelText('Table');
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'foo', { container: document.body });

    expect(ds.postResource).toHaveBeenCalledWith(
      QueryEditorFieldType.Tables,
      expect.objectContaining({ region: defaultKey, catalog: defaultKey, database: defaultKey })
    );
    expect(onChange).toHaveBeenCalledWith({
      ...q,
      table: 'foo',
    });
    expect(onRunQuery).not.toHaveBeenCalled();
  });

  it('should request select columns and not execute the query', async () => {
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    ds.postResource = jest.fn().mockResolvedValue(['columnName']);
    ds.getColumns = jest.fn((query) =>
      ds.postResource(QueryEditorFieldType.Columns, {
        region: query.connectionArgs.region,
        catalog: query.connectionArgs.catalog,
        database: query.connectionArgs.database,
        table: query.table,
      })
    );
    render(
      <QueryEditorForm
        {...props}
        onChange={onChange}
        onRunQuery={onRunQuery}
        query={{ ...props.query, table: 'tableName' }}
      />
    );

    const selectEl = screen.getByLabelText('Column');
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'columnName', { container: document.body });

    expect(ds.postResource).toHaveBeenCalledWith(
      QueryEditorFieldType.Columns,
      expect.objectContaining({ region: defaultKey, catalog: defaultKey, database: defaultKey, table: 'tableName' })
    );
    expect(onChange).toHaveBeenCalledWith({
      ...q,
      column: 'columnName',
      table: 'tableName',
    });
    expect(onRunQuery).not.toHaveBeenCalled();
  });

  it('should display query options by default', async () => {
    render(<QueryEditorForm {...props} />);
    const selectEl = screen.getByLabelText('Format data frames as');
    expect(selectEl).toBeInTheDocument();
  });
  it('should update query with defaults on mount', () => {
    render(<QueryEditorForm {...props} />);
    expect(props.onChange).toHaveBeenCalledWith({ ...defaultQuery, ...props.query });
  });
});
