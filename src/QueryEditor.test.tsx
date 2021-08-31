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

    const selector = screen.getByText(`default (${ds.defaultRegion})`);
    expect(selector).toBeInTheDocument();
    selector.click();
    expect(ds.getResource).toHaveBeenCalledWith('regions');

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.region.input);
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'foo', { container: document.body });

    expect(onChange).toHaveBeenCalledWith({
      ...q,
      connectionArgs: { region: 'foo', catalog: '', database: '' },
    });
  });

  it('should request catalogs and use a new one', async () => {
    const onChange = jest.fn();
    ds.postResource = jest.fn().mockResolvedValue([ds.defaultCatalog, 'foo']);
    render(<QueryEditor {...props} onChange={onChange} />);

    const selector = screen.getByText(`default (${ds.defaultCatalog})`);
    expect(selector).toBeInTheDocument();
    selector.click();
    expect(ds.postResource).toHaveBeenCalledWith('catalogs', { region: 'default' });

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.catalog.input);
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'foo', { container: document.body });

    expect(onChange).toHaveBeenCalledWith({
      ...q,
      connectionArgs: { region: 'default', catalog: 'foo', database: '' },
    });
  });

  it('should request databases and execute the query', async () => {
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    ds.postResource = jest.fn().mockResolvedValue([ds.defaultDatabase, 'foo']);
    render(<QueryEditor {...props} onChange={onChange} onRunQuery={onRunQuery} />);

    const selector = screen.getByText(`default (${ds.defaultDatabase})`);
    expect(selector).toBeInTheDocument();
    selector.click();
    expect(ds.postResource).toHaveBeenCalledWith('databases', { region: 'default', catalog: 'default' });

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.database.input);
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'foo', { container: document.body });

    expect(onChange).toHaveBeenCalledWith({
      ...q,
      connectionArgs: { region: 'default', catalog: 'default', database: 'foo' },
    });
    expect(onRunQuery).toHaveBeenCalled();
  });
});
