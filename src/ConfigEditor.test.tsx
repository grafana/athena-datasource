import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfigEditor } from './ConfigEditor';
import { mockDatasourceOptions } from './__mocks__/datasource';
import { select } from 'react-select-event';
import { selectors } from 'tests/selectors';
import { AwsAuthType } from '@grafana/aws-sdk';
import * as runtime from '@grafana/runtime';
import userEvent from '@testing-library/user-event';

const resourceName = 'foo';
const props = mockDatasourceOptions;

const setUpMockBackendServer = (mockBackendSrv: { put: () => void; post: () => void }) => {
  jest.spyOn(runtime, 'getBackendSrv').mockImplementation(() => mockBackendSrv as unknown as runtime.BackendSrv);
};

describe('ConfigEditor', () => {
  it('should save and request catalogs', async () => {
    setUpMockBackendServer({
      put: jest.fn().mockResolvedValue({ datasource: {} }),
      post: jest.fn().mockResolvedValue([resourceName]),
    });

    const onChange = jest.fn();
    render(<ConfigEditor {...props} onOptionsChange={onChange} />);

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.catalog.input);
    expect(selectEl).toBeInTheDocument();

    await waitFor(() => select(selectEl, resourceName, { container: document.body }));

    expect(onChange).toHaveBeenCalledWith({
      ...props.options,
      jsonData: { ...props.options.jsonData, catalog: resourceName },
    });
  });

  it('should save and request databases', async () => {
    setUpMockBackendServer({
      put: jest.fn().mockResolvedValue({ datasource: {} }),
      post: jest.fn().mockResolvedValue([resourceName]),
    });

    const onChange = jest.fn();
    render(<ConfigEditor {...props} onOptionsChange={onChange} />);

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.database.input);
    expect(selectEl).toBeInTheDocument();

    await waitFor(() => select(selectEl, resourceName, { container: document.body }));

    expect(onChange).toHaveBeenCalledWith({
      ...props.options,
      jsonData: { ...props.options.jsonData, database: resourceName },
    });
  });

  it('should save and request workgroups', async () => {
    setUpMockBackendServer({
      put: jest.fn().mockResolvedValue({ datasource: {} }),
      post: jest.fn().mockResolvedValue([resourceName]),
    });

    const onChange = jest.fn();
    render(<ConfigEditor {...props} onOptionsChange={onChange} />);

    const selectEl = screen.getByLabelText(selectors.components.ConfigEditor.workgroup.input);
    expect(selectEl).toBeInTheDocument();

    await waitFor(() => select(selectEl, resourceName, { container: document.body }));

    expect(onChange).toHaveBeenCalledWith({
      ...props.options,
      jsonData: { ...props.options.jsonData, workgroup: resourceName },
    });
  });

  it('should use an output location', async () => {
    setUpMockBackendServer({
      put: jest.fn().mockResolvedValue({ datasource: {} }),
      post: jest.fn().mockResolvedValue([resourceName]),
    });

    const onChange = jest.fn();
    render(<ConfigEditor {...props} onOptionsChange={onChange} />);
    const input = screen.getByTestId(selectors.components.ConfigEditor.OutputLocation.wrapper);
    const bucket = 's3://foo';
    fireEvent.change(input, { target: { value: bucket } });
    expect(onChange).toHaveBeenCalledWith({
      ...props.options,
      jsonData: { ...props.options.jsonData, outputLocation: bucket },
    });
  });

  it('should fetch and display externalId when the auth type is grafana_assume_role', async () => {
    setUpMockBackendServer({
      put: jest.fn().mockResolvedValue({ datasource: {} }),
      post: jest.fn().mockResolvedValue({ externalId: 'fake-external-id' }),
    });

    render(
      <ConfigEditor
        {...props}
        options={{
          ...props.options,
          jsonData: {
            ...props.options.jsonData,
            authType: AwsAuthType.GrafanaAssumeRole,
          },
        }}
      />
    );

    // The selected option and the link to the docs both have the same text
    expect(screen.queryAllByText('Grafana Assume Role').length).toBe(2);
    expect(screen.getByRole('link', { name: 'Grafana Assume Role' })).toBeInTheDocument();
    const instructionsButton = await screen.findByRole('button', {
      name: /How to create an IAM role for grafana to assume/i,
    });
    await userEvent.click(instructionsButton);
    expect(screen.queryByText('fake-external-id')).toBeInTheDocument();
  });

  it('gracefully handles when the fetch for external id throws an error', async () => {
    setUpMockBackendServer({
      put: jest.fn().mockResolvedValue({ datasource: {} }),
      post: jest.fn().mockRejectedValue('the server exploded for some reason'),
    });

    render(
      <ConfigEditor
        {...props}
        options={{
          ...props.options,
          jsonData: {
            ...props.options.jsonData,
            authType: AwsAuthType.GrafanaAssumeRole,
          },
        }}
      />
    );

    // The selected option and the link to the docs both have the same text
    expect(screen.queryAllByText('Grafana Assume Role').length).toBe(2);
    expect(screen.getByRole('link', { name: 'Grafana Assume Role' })).toBeInTheDocument();
    const instructionsButton = await screen.findByRole('button', {
      name: /How to create an IAM role for grafana to assume/i,
    });
    await userEvent.click(instructionsButton);
    expect(screen.queryByText('External Id is currently unavailable')).toBeInTheDocument();
  });

  it('gracefully handles when the fetch for external id return an empty string', async () => {
    setUpMockBackendServer({
      put: jest.fn().mockResolvedValue({ datasource: {} }),
      post: jest.fn().mockResolvedValue({ externalId: '' }),
    });

    render(
      <ConfigEditor
        {...props}
        options={{
          ...props.options,
          jsonData: {
            ...props.options.jsonData,
            authType: AwsAuthType.GrafanaAssumeRole,
          },
        }}
      />
    );

    // The selected option and the link to the docs both have the same text
    expect(screen.queryAllByText('Grafana Assume Role').length).toBe(2);
    expect(screen.getByRole('link', { name: 'Grafana Assume Role' })).toBeInTheDocument();
    const instructionsButton = await screen.findByRole('button', {
      name: /How to create an IAM role for grafana to assume/i,
    });
    await userEvent.click(instructionsButton);
    expect(screen.queryByText('External Id is currently unavailable')).toBeInTheDocument();
  });
});
