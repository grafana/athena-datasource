import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryEditor } from './QueryEditor';
import { mockDatasource, mockQuery } from './__mocks__/datasource';
import '@testing-library/jest-dom';
import { select } from 'react-select-event';

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

    expect(screen.getByText(`default (${ds.defaultRegion})`)).toBeInTheDocument();
    expect(ds.getResource).toHaveBeenCalledWith('regions');

    const selectEl = screen.getByLabelText('Region');
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'foo', { container: document.body });

    expect(onChange).toHaveBeenCalledWith({
      ...q,
      connectionArgs: { region: 'foo' },
    });
  });
});
