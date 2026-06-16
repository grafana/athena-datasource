import React from 'react';
import { render, screen } from '@testing-library/react';
import { VariableQueryCodeEditor } from './VariableQueryEditor';
import { mockDatasource, mockQuery } from './__mocks__/datasource';
import '@testing-library/jest-dom';
import * as runtime from '@grafana/runtime';
import * as pluginUi from '@grafana/plugin-ui';

const ds = mockDatasource;
const q = mockQuery;

const mockGetVariables = jest.fn().mockReturnValue([]);

jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({
  getVariables: mockGetVariables,
  replace: jest.fn(),
  containsTemplate: jest.fn(),
  updateTimeRange: jest.fn(),
}));

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

describe('VariableQueryEditor', () => {
  it('should not display query options', async () => {
    render(<VariableQueryCodeEditor {...props} />);
    const selectEl = screen.queryByLabelText('Format as');
    expect(selectEl).toBeNull();
  });
});
