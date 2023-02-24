import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultReuse } from './ResultReuse';
import { mockQuery } from '__mocks__/datasource';

describe('ResultReuse', () => {
  it('options should be enabled if `enabled=true`', () => {
    render(<ResultReuse enabled={true} onChange={() => {}} query={mockQuery} />);
    const toggle = screen.getByLabelText('Enable');
    const ttlInput = screen.getByLabelText('TTL (mins)');

    expect(toggle).toBeEnabled();
    expect(ttlInput).toBeEnabled();
  });

  it('options should be disabled if `enabled=false`', () => {
    render(<ResultReuse enabled={false} onChange={() => {}} query={mockQuery} />);
    const toggle = screen.getByLabelText('Enable');
    const ttlInput = screen.getByLabelText('TTL (mins)');

    expect(toggle).toBeDisabled();
    expect(ttlInput).toBeDisabled();
  });
});
