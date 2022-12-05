import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryEditor } from './QueryEditor';
import { mockDatasource, mockQuery } from './__mocks__/datasource';
import '@testing-library/jest-dom';
import { select } from 'react-select-event';
import { selectors } from 'tests/selectors';
import { defaultKey } from 'types';
import * as runtime from '@grafana/runtime';
import * as experimental from '@grafana/experimental';

const ds = mockDatasource;
const q = mockQuery;

const mockGetVariables = jest.fn().mockReturnValue([]);

jest.spyOn(ds, 'getVariables').mockImplementation(mockGetVariables);

jest.mock('@grafana/experimental', () => ({
  ...jest.requireActual<typeof experimental>('@grafana/experimental'),
  SQLEditor: function SQLEditor() {
    return <></>;
  },
}));

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual<typeof runtime>('@grafana/runtime'),
  config: {
    featureToggles: {
      athenaAsyncQueryDataSupport: true,
    },
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
    ds.getRegions = jest.fn(() => ds.getResource('regions'));
    render(<QueryEditor {...props} onChange={onChange} />);

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.region.input);
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'foo', { container: document.body });

    expect(ds.getResource).toHaveBeenCalledWith('regions');
    expect(onChange).toHaveBeenCalledWith({
      ...q,
      connectionArgs: { ...q.connectionArgs, region: 'foo' },
    });
  });

  it('should request catalogs and use a new one', async () => {
    const onChange = jest.fn();
    ds.postResource = jest.fn().mockResolvedValue([ds.defaultCatalog, 'foo']);
    ds.getCatalogs = jest.fn((query) => ds.postResource('catalogs', { region: query.connectionArgs.region }));
    render(<QueryEditor {...props} onChange={onChange} />);

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.catalog.input);
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'foo', { container: document.body });

    expect(ds.postResource).toHaveBeenCalledWith('catalogs', { region: defaultKey });
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
      ds.postResource('databases', { region: query.connectionArgs.region, catalog: query.connectionArgs.catalog })
    );
    render(<QueryEditor {...props} onChange={onChange} onRunQuery={onRunQuery} />);

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.database.input);
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'foo', { container: document.body });

    expect(ds.postResource).toHaveBeenCalledWith('databases', { region: defaultKey, catalog: defaultKey });
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
      ds.postResource('tables', {
        region: query.connectionArgs.region,
        catalog: query.connectionArgs.catalog,
        database: query.connectionArgs.database,
      })
    );
    render(<QueryEditor {...props} onChange={onChange} onRunQuery={onRunQuery} />);

    const selectEl = screen.getByLabelText('Table');
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'foo', { container: document.body });

    expect(ds.postResource).toHaveBeenCalledWith('tables', { ...q.connectionArgs });
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
      ds.postResource('columns', {
        region: query.connectionArgs.region,
        catalog: query.connectionArgs.catalog,
        database: query.connectionArgs.database,
        table: query.table,
      })
    );
    render(
      <QueryEditor
        {...props}
        onChange={onChange}
        onRunQuery={onRunQuery}
        query={{ ...props.query, table: 'tableName' }}
      />
    );

    const selectEl = screen.getByLabelText('Column');
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'columnName', { container: document.body });

    expect(ds.postResource).toHaveBeenCalledWith('columns', {
      ...q.connectionArgs,
      table: 'tableName',
    });
    expect(onChange).toHaveBeenCalledWith({
      ...q,
      column: 'columnName',
      table: 'tableName',
    });
    expect(onRunQuery).not.toHaveBeenCalled();
  });

  it('run button should be disabled if the query is not valid', () => {
    render(<QueryEditor {...props} query={{ ...props.query, rawSQL: '' }} />);
    const runButton = screen.getByRole('button', { name: 'Run' });
    expect(runButton).toBeDisabled();
  });

  it('should run queries when the run button is clicked', () => {
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<QueryEditor {...props} onRunQuery={onRunQuery} onChange={onChange} />);
    const runButton = screen.getByRole('button', { name: 'Run' });
    expect(runButton).toBeInTheDocument();

    expect(onRunQuery).not.toBeCalled();
    fireEvent.click(runButton);
    expect(onRunQuery).toBeCalledTimes(1);
  });

  it('stop button should be disabled until run button is clicked', () => {
    render(<QueryEditor {...props} />);
    const runButton = screen.getByRole('button', { name: 'Run' });
    const stopButton = screen.getByRole('button', { name: 'Stop' });
    expect(stopButton).toBeInTheDocument();
    expect(stopButton).toBeDisabled();
    fireEvent.click(runButton);
    expect(stopButton).not.toBeDisabled();
  });

  it('should display query options by default', async () => {
    render(<QueryEditor {...props} />);
    const selectEl = screen.getByLabelText('Format as');
    expect(selectEl).toBeInTheDocument();
  });
});
