import React from 'react';
import { Checkbox, Field, InlineField, Input, Switch, useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { AthenaQuery, DEFAULT_RESULT_REUSE_ENABLED, DEFAULT_RESULT_REUSE_MAX_AGE_IN_MINUTES } from '../types';
import { EditorField } from '@grafana/experimental';

interface ResultReuseProps {
  query: AthenaQuery;
  newFormStylingEnabled?: boolean;
  enabled?: boolean;
  onChange: (value: AthenaQuery) => void;
}

export const ResultReuse = ({ enabled, onChange, query, newFormStylingEnabled }: ResultReuseProps) => {
  const {
    connectionArgs: {
      resultReuseEnabled = DEFAULT_RESULT_REUSE_ENABLED,
      resultReuseMaxAgeInMinutes = DEFAULT_RESULT_REUSE_MAX_AGE_IN_MINUTES,
    } = {},
  } = query;

  const handleEnabledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.currentTarget;
    onChange({
      ...query,
      connectionArgs: {
        ...query.connectionArgs,
        resultReuseEnabled: checked,
      },
    });
  };

  const handleTTLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;

    onChange({
      ...query,
      connectionArgs: {
        ...query.connectionArgs,
        resultReuseMaxAgeInMinutes: Number(value),
      },
    });
  };

  const invalidResultReuseMaxAgeInMinutes = resultReuseMaxAgeInMinutes < 0 || resultReuseMaxAgeInMinutes > 10080;

  return (
    <>
      {newFormStylingEnabled ? (
        <div style={{ display: 'flex' }}>
          <EditorField className="width-5" disabled={!enabled} label="Enable" htmlFor="query-result-reuse-toggle">
            <Switch
              id="query-result-reuse-toggle"
              value={resultReuseEnabled && enabled}
              onChange={handleEnabledChange}
            />
          </EditorField>
          <EditorField
            className="width-10"
            disabled={!enabled}
            invalid={invalidResultReuseMaxAgeInMinutes}
            label="TTL (mins)"
            htmlFor="query-result-reuse-ttl"
            tooltip="The maximum age for reusing query results in minutes. Minimum 0, maximum 10080."
          >
            <Input
              id="query-result-reuse-ttl"
              min={0}
              max={10080}
              onChange={handleTTLChange}
              onBlur={handleTTLChange}
              type="number"
              value={resultReuseMaxAgeInMinutes}
            />
          </EditorField>
        </div>
      ) : (
        <>
          <InlineField labelWidth={13} disabled={!enabled} label="Enable" aria-label="Enable query result reuse">
            <Checkbox
              id="query-result-reuse-toggle"
              onChange={handleEnabledChange}
              value={resultReuseEnabled && enabled}
            />
          </InlineField>
          <InlineField
            labelWidth={13}
            disabled={!enabled}
            invalid={invalidResultReuseMaxAgeInMinutes}
            label="TTL (mins)"
            aria-label="Max age in minutes"
            tooltip="The maximum age for reusing query results in minutes. Minimum 0, maximum 10080."
          >
            <Input
              id="query-result-reuse-ttl"
              className="width-11"
              min={0}
              max={10080}
              onChange={handleTTLChange}
              onBlur={handleTTLChange}
              type="number"
              value={resultReuseMaxAgeInMinutes}
            />
          </InlineField>
        </>
      )}
    </>
  );
};
