export const appendTemplateVariables = (variables: string[], options: string[]) => {
  const variableOptionGroup = {
    label: 'Template Variables',
    options: variables.map((value) => ({ label: value, value })),
  };
  return [...options, variableOptionGroup];
};
