import { SelectableValue } from '@grafana/data';
import { DataSource } from 'datasource';

export const appendTemplateVariables = (datasource: DataSource, options: Array<SelectableValue<string>>) => {
  const variableOptionGroup = {
    label: 'Template Variables',
    options: datasource.getVariables().map((value) => ({ label: value, value })),
  };
  return [...options, variableOptionGroup];
};
