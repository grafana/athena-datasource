import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryEditor } from './QueryEditor';
import { mockDatasource, mockQuery } from './__mocks__/datasource';
import '@testing-library/jest-dom';
import { select } from 'react-select-event';
import { selectors } from 'tests/selectors';

const ds = mockDatasource;
const q = mockQuery;

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
    render(<QueryEditor {...props} onChange={onChange} />);

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.catalog.input);
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'foo', { container: document.body });

    expect(ds.postResource).toHaveBeenCalledWith('catalogs', { region: 'default' });
    expect(onChange).toHaveBeenCalledWith({
      ...q,
      connectionArgs: { ...q.connectionArgs, catalog: 'foo' },
    });
  });

  it('should request databases and execute the query', async () => {
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    ds.postResource = jest.fn().mockResolvedValue([ds.defaultDatabase, 'foo']);
    render(<QueryEditor {...props} onChange={onChange} onRunQuery={onRunQuery} />);

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.database.input);
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'foo', { container: document.body });

    expect(ds.postResource).toHaveBeenCalledWith('databases', { region: 'default', catalog: 'default' });
    expect(onChange).toHaveBeenCalledWith({
      ...q,
      connectionArgs: { ...q.connectionArgs, database: 'foo' },
    });
    expect(onRunQuery).toHaveBeenCalled();
  });
});
