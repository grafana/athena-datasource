import { fireEvent, render, screen } from '@testing-library/react';
import { QueryEditor } from 'QueryEditor';
import React from 'react';
import { mockDatasource, mockQuery } from './__mocks__/datasource';
import * as experimental from '@grafana/experimental';
import * as runtime from '@grafana/runtime';
import { config } from '@grafana/runtime';

const ds = mockDatasource;
const q = { ...mockQuery, rawSQL: '' };

const mockGetVariables = jest.fn().mockReturnValue([]);

jest.spyOn(ds, 'getVariables').mockImplementation(mockGetVariables);

jest.mock('@grafana/experimental', () => ({
  ...jest.requireActual<typeof experimental>('@grafana/experimental'),
  SQLEditor: function SQLEditor(props: any) {
    return (
      <input {...props} data-testid="codeEditor" onChange={(event: any) => props.onChange(event.target.value)}></input>
    );
  },
}));

const props = {
  datasource: ds,
  query: q,
  onChange: jest.fn(),
  onRunQuery: jest.fn(),
};
jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual<typeof runtime>('@grafana/runtime'),
  config: {
    featureToggles: {
      athenaAsyncQueryDataSupport: true,
    },
  },
}));

beforeEach(() => {
  ds.getResource = jest.fn().mockResolvedValue([]);
  ds.postResource = jest.fn().mockResolvedValue([]);
});

describe('Query Editor', () => {
  it('run button should be disabled if the query is empty', () => {
    render(<QueryEditor {...props} />);
    const runButton = screen.getByRole('button', { name: 'Run query' });
    expect(runButton).toBeDisabled();
  });
  it('should show cancel button if athenaAsyncQueryDataSupport feature is enabled', () => {
    render(<QueryEditor {...props} />);
    const cancelButton = screen.getByRole('button', { name: 'Stop query' });
    expect(cancelButton).toBeInTheDocument();
  });
  it('should not show cancel button if athenaAsyncQueryDataSupport feature is disabled', () => {
    config.featureToggles.athenaAsyncQueryDataSupport = false;
    render(<QueryEditor {...props} />);
    const cancelButton = screen.queryByRole('button', { name: 'Stop query' });
    expect(cancelButton).not.toBeInTheDocument();
  });
  it('should re-enable Run query button if there is a change to the query', async () => {
    render(<QueryEditor {...props} query={{ ...props.query, rawSQL: 'initial query' }} />);
    const runButton = screen.getByRole('button', { name: 'Run query' });
    expect(runButton).toBeDisabled();

    const input = screen.getByTestId('codeEditor');
    expect(input).toBeDefined();

    fireEvent.change(input, { target: { value: 'test query' } });

    expect(props.onChange).toHaveBeenCalledWith({ ...props.query, rawSQL: 'test query' });
    expect(runButton).not.toBeDisabled();
  });
});
