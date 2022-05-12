import { SelectableValue } from '@grafana/data';

export const appendTemplateVariables = (variables: string[], options: Array<SelectableValue<string>>) => {
  const variableOptionGroup = {
    label: 'Template Variables',
    options: variables.map((value) => ({ label: value, value })),
  };
  return [...options, variableOptionGroup];
};
