import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SQLEditor from './SQLEditor';
import { mockDatasource, mockQuery } from './__mocks__/datasource';
import * as pluginUi from '@grafana/plugin-ui';

jest.mock('@grafana/plugin-ui', () => ({
  ...jest.requireActual<typeof pluginUi>('@grafana/plugin-ui'),
  SQLEditor: jest.fn(() => <></>),
}));

describe('SQLEditor', () => {
  const ds = mockDatasource;
  const q = mockQuery;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onChange with updated rawSQL when the query text changes', () => {
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<SQLEditor query={q} onChange={onChange} onRunQuery={onRunQuery} datasource={ds} />);

    const props = (pluginUi.SQLEditor as unknown as jest.Mock).mock.calls[0][0];
    props.onChange('SELECT 1', false);

    expect(onChange).toHaveBeenCalledWith({ ...q, rawSQL: 'SELECT 1' });
    expect(onRunQuery).not.toHaveBeenCalled();
  });

  it('runs the query when processQuery is true (Cmd/Ctrl+Enter)', () => {
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(<SQLEditor query={q} onChange={onChange} onRunQuery={onRunQuery} datasource={ds} />);

    const props = (pluginUi.SQLEditor as unknown as jest.Mock).mock.calls[0][0];
    props.onChange('SELECT 2', true);

    expect(onChange).toHaveBeenCalledWith({ ...q, rawSQL: 'SELECT 2' });
    expect(onRunQuery).toHaveBeenCalledTimes(1);
  });

  it('does not throw if onRunQuery is not provided', () => {
    const onChange = jest.fn();
    render(<SQLEditor query={q} onChange={onChange} datasource={ds} />);

    const props = (pluginUi.SQLEditor as unknown as jest.Mock).mock.calls[0][0];
    expect(() => props.onChange('SELECT 3', true)).not.toThrow();
    expect(onChange).toHaveBeenCalledWith({ ...q, rawSQL: 'SELECT 3' });
  });
});
