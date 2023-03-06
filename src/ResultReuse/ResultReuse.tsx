import React from 'react';
import { Checkbox, InlineField, Input, useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { AthenaQuery, DEFAULT_RESULT_REUSE_ENABLED, DEFAULT_RESULT_REUSE_MAX_AGE_IN_MINUTES } from '../types';
import { GrafanaTheme2 } from '@grafana/data';

interface ResultReuseProps {
  query: AthenaQuery;
  enabled?: boolean;
  onChange: (value: AthenaQuery) => void;
}

export const ResultReuse = ({ enabled, onChange, query }: ResultReuseProps) => {
  const {
    connectionArgs: {
      resultReuseEnabled = DEFAULT_RESULT_REUSE_ENABLED,
      resultReuseMaxAgeInMinutes = DEFAULT_RESULT_REUSE_MAX_AGE_IN_MINUTES,
    } = {},
  } = query;
  const styles = useStyles2(getStyles);

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
      <h6>Query result reuse {!enabled && <span className={styles.optional}>(engine version 3 only)</span>}</h6>
      <InlineField labelWidth={13} disabled={!enabled} label="Enable" aria-label="Enable query result reuse">
        <Checkbox id="query-result-reuse-toggle" onChange={handleEnabledChange} value={resultReuseEnabled && enabled} />
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
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  optional: css({
    fontSize: 12,
    fontStyle: 'italic',
    color: theme.colors.text.secondary,
  }),
});
