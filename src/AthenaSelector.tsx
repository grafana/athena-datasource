import { isEqual } from 'lodash';
import React, { useState, useEffect, useCallback } from 'react';
import { SelectableValue } from '@grafana/data';
import { InlineField, Select } from '@grafana/ui';

export const isMissingDependency = (dependencies: Record<string, string | undefined>) =>
  Object.keys(dependencies).some((dep: string) => !dependencies[dep]);

export enum optionStatus {
  initial,
  fetching,
  fetched,
  errored,
}

const initialOptions: Array<SelectableValue<string>> = [];
export function useDropdownOptions(fetchFn: () => Promise<string[]>, dependencies: Record<string, string | undefined>) {
  const [dropdownOptions, setDropdownOptions] = useState(initialOptions);
  const [status, setStatus] = useState(optionStatus.initial);
  const [lastDependencies, setLastDependencies] = useState(dependencies);

  const getOptions = useCallback(async () => {
    const dependenciesChanged = Object.keys(lastDependencies).some(
      (depKey) => !isEqual(lastDependencies[depKey], dependencies[depKey])
    );
    const shouldFetchOptions =
      (dependenciesChanged || status === optionStatus.initial) && !isMissingDependency(dependencies);
    if (!shouldFetchOptions) {
      return;
    }
    setStatus(optionStatus.fetching);
    setLastDependencies(dependencies);
    setDropdownOptions(initialOptions);

    try {
      // otherwise fetch them
      const fetchedOptions = await fetchFn();

      // format into a selectable object
      const options = (fetchedOptions || []).map((name: string) => {
        return { label: name, value: name };
      });

      // cache them
      setDropdownOptions(options);
      setStatus(optionStatus.fetched);
    } catch (err) {
      console.error(err);
      setStatus(optionStatus.errored);
    }
  }, [dependencies, lastDependencies, fetchFn, status]);

  useEffect(() => {
    getOptions();
  }, [getOptions]);

  return { dropdownOptions, status };
}

type DropdownSelectProps = {
  label: string;
  labelWidth: number;
  value: string | undefined;
  selectOption: (value: SelectableValue<any>) => void;
  fetchFn: () => Promise<string[]>;
  dependencies: Record<string, string | undefined>;
};

// a dropdown selector that fetch options on render,
// and clears selection and refetch options if dependencies change
export function AthenaSelector({ label, labelWidth, fetchFn, dependencies, value, selectOption }: DropdownSelectProps) {
  const { dropdownOptions, status } = useDropdownOptions(fetchFn, dependencies);

  return (
    <InlineField label={label} labelWidth={labelWidth}>
      <Select
        aria-label={label}
        options={dropdownOptions}
        value={value || null}
        onChange={selectOption}
        isLoading={status === optionStatus.fetching}
        className={'min-width-6'}
        allowCustomValue
      />
    </InlineField>
  );
}
