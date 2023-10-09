import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigEditor } from './ConfigEditor';
import { mockDatasourceOptions } from './__mocks__/datasource';
import { select } from 'react-select-event';
import { selectors } from 'tests/selectors';
import { config } from '@grafana/runtime';

const resourceName = 'foo';

jest.mock('@grafana/aws-sdk', () => {
  return {
    ...(jest.requireActual('@grafana/aws-sdk') as any),
    ConnectionConfig: function ConnectionConfig() {
      return <></>;
    },
  };
});
jest.mock('@grafana/runtime', () => {
  return {
    ...(jest.requireActual('@grafana/runtime') as any),
    getBackendSrv: () => ({
      put: jest.fn().mockResolvedValue({ datasource: {} }),
      post: jest.fn().mockResolvedValue([resourceName]),
    }),
    featureToggles: {
      awsDatasourcesNewFormStyling: false,
    },
  };
});
const props = mockDatasourceOptions;

describe('ConfigEditor', () => {
  function run(testName: string) {
    describe(testName, () => {
      it('should save and request catalogs', async () => {
        const onChange = jest.fn();
        render(<ConfigEditor {...props} onOptionsChange={onChange} />);

        const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.catalog.input);
        expect(selectEl).toBeInTheDocument();

        await select(selectEl, resourceName, { container: document.body });

        expect(onChange).toHaveBeenCalledWith({
          ...props.options,
          jsonData: { ...props.options.jsonData, catalog: resourceName },
        });
      });

      it('should save and request databases', async () => {
        const onChange = jest.fn();
        render(<ConfigEditor {...props} onOptionsChange={onChange} />);

        const d = screen.getByTestId(selectors.components.ConfigEditor.database.wrapper);
        expect(d).toBeInTheDocument();
        d.click();

        const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.database.input);
        expect(selectEl).toBeInTheDocument();

        await select(selectEl, resourceName, { container: document.body });

        expect(onChange).toHaveBeenCalledWith({
          ...props.options,
          jsonData: { ...props.options.jsonData, database: resourceName },
        });
      });

      it('should save and request workgroups', async () => {
        const onChange = jest.fn();
        render(<ConfigEditor {...props} onOptionsChange={onChange} />);

        const d = screen.getByTestId(selectors.components.ConfigEditor.workgroup.wrapper);
        expect(d).toBeInTheDocument();
        d.click();

        const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.workgroup.input);
        expect(selectEl).toBeInTheDocument();

        await select(selectEl, resourceName, { container: document.body });

        expect(onChange).toHaveBeenCalledWith({
          ...props.options,
          jsonData: { ...props.options.jsonData, workgroup: resourceName },
        });
      });

      it('should use an output location', async () => {
        const onChange = jest.fn();
        render(<ConfigEditor {...props} onOptionsChange={onChange} />);
        const input = screen.getByTestId(selectors.components.ConfigEditor.OutputLocation.wrapper);
        const bucket = 's3://foo';
        fireEvent.change(input, { target: { value: bucket } });
        expect(onChange).toBeCalledWith({
          ...props.options,
          jsonData: { ...props.options.jsonData, outputLocation: bucket },
        });
      });
    });
  }
  run('ConfigEditor with newFormStyling disabled');
  config.featureToggles.awsDatasourcesNewFormStyling = true;
  run('ConfigEditor with newFormStyling enabled');
});
