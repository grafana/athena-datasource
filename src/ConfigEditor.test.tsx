import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConfigEditor } from './ConfigEditor';
import { mockDatasourceOptions } from './__mocks__/datasource';
import { select } from 'react-select-event';

const catalogName = 'foo';

jest.mock('@grafana/aws-sdk', () => {
  return {
    ...(jest.requireActual('@grafana/aws-sdk') as any),
    ConnectionConfig: () => <></>,
  };
});
jest.mock('@grafana/runtime', () => {
  return {
    ...(jest.requireActual('@grafana/runtime') as any),
    getBackendSrv: () => ({
      put: jest.fn().mockResolvedValue({ datasource: {} }),
      post: jest.fn().mockResolvedValue([catalogName]),
    }),
  };
});
const props = mockDatasourceOptions;

describe('ConfigEditor', () => {
  it('should save and request catalogs when clicking on the catalogs selector', async () => {
    const onChange = jest.fn();
    render(<ConfigEditor {...props} onOptionsChange={onChange} />);

    const d = screen.getByTestId('onloadcatalogs');
    expect(d).toBeInTheDocument();
    d.click();

    const selectEl = screen.getByLabelText('Catalog (datasource)');
    expect(selectEl).toBeInTheDocument();

    await select(selectEl, catalogName, { container: document.body });

    expect(onChange).toHaveBeenCalledWith({
      ...props.options,
      jsonData: { ...props.options.jsonData, catalog: catalogName },
    });
  });
});
