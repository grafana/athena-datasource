import React, { useState, useEffect, useMemo } from 'react';
import { SelectableValue } from '@grafana/data';
import { InlineField, Select } from '@grafana/ui';
import { ResourceType } from './ConfigEditor';
import { selectors } from './tests/selectors';

export type QueryResourceType = ResourceType | 'region';

type Props = {
  resource: QueryResourceType;
  value: string | null;
  list: string[];
  fetch: () => Promise<void>;
  onChange: (v: string) => void;
  default?: string;
  title?: string;
  disabled?: boolean;
  labelWidth?: number;
  className?: string;
};

export function AthenaResourceSelector(props: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const defaultOpt = useMemo(
    () => ({
      label: `default (${props.default})`,
      value: 'default',
      description: `Default ${props.resource} set in the data source`,
    }),
    [props.resource, props.default]
  );
  const [options, setOptions] = useState<Array<SelectableValue<string>>>(props.default ? [defaultOpt] : []);

  useEffect(() => {
    if (props.list.length) {
      const newOptions: Array<SelectableValue<string>> = props.default ? [defaultOpt] : [];
      props.list.forEach((r) => {
        if (r !== props.default) {
          newOptions.push({ label: r, value: r });
        }
      });
      setOptions(newOptions);
    } else {
      setOptions([]);
    }
  }, [defaultOpt, props.default, props.list]);

  const onChange = (e: SelectableValue<string>) => {
    if (e.value) {
      props.onChange(e.value);
    }
  };
  const onClick = async () => {
    setIsLoading(true);
    try {
      await props.fetch();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InlineField label={selectors.components.ConfigEditor[props.resource].input} labelWidth={props.labelWidth}>
      <div data-testid={`onload${props.resource}`} onClick={onClick} title={props.title}>
        <Select
          aria-label={selectors.components.ConfigEditor[props.resource].input}
          options={options}
          value={props.value}
          onChange={onChange}
          isLoading={isLoading}
          className={props.className || 'min-width-6'}
          disabled={props.disabled}
        />
      </div>
    </InlineField>
  );
}
