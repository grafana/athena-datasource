import { render, screen } from '@testing-library/react';
import { QueryEditor } from 'QueryEditor';
import React from 'react';
import { mockDatasource, mockQuery } from './__mocks__/datasource';
import * as pluginUi from '@grafana/plugin-ui';

const ds = mockDatasource;
const q = { ...mockQuery, rawSQL: '' };

const mockGetVariables = jest.fn().mockReturnValue([]);

jest.spyOn(ds, 'getVariables').mockImplementation(mockGetVariables);

jest.mock('@grafana/plugin-ui', () => ({
  ...jest.requireActual<typeof pluginUi>('@grafana/plugin-ui'),
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
  it('should show cancel button', () => {
    render(<QueryEditor {...props} />);
    const cancelButton = screen.getByRole('button', { name: 'Stop query' });
    expect(cancelButton).toBeInTheDocument();
  });
});
