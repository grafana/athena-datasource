import React from 'react';
import { render, screen } from '@testing-library/react';
import { AthenaResourceSelector, QueryResourceType } from './AthenaResourceSelector';
import { select } from 'react-select-event';
import { defaultKey } from 'types';

const props = {
  resource: 'catalog' as QueryResourceType,
  value: null,
  list: [],
  fetch: jest.fn(),
  onChange: jest.fn(),
};

describe('AthenaResourceSelector', () => {
  it('should include a default option', () => {
    render(<AthenaResourceSelector {...props} default="foo" value={defaultKey} />);
    expect(screen.queryByText('default (foo)')).toBeInTheDocument();
  });

  it('should select a new option', async () => {
    const onChange = jest.fn();
    const fetch = jest.fn().mockResolvedValue(['foo', 'bar']);
    render(<AthenaResourceSelector {...props} default="foo" value={defaultKey} fetch={fetch} onChange={onChange} />);
    expect(screen.queryByText('default (foo)')).toBeInTheDocument();

    const selectEl = screen.getByLabelText('Catalog (datasource)');
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, 'bar', { container: document.body });
    expect(fetch).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('bar');
  });
});
