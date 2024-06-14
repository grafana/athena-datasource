import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultReuse } from './ResultReuse';
import { mockQuery } from '__mocks__/datasource';

describe('ResultReuse', () => {
  function run(testName: string, newFormStylingEnabled?: boolean) {
    describe(testName, () => {
      it('options should be enabled if `enabled=true`', () => {
        render(
          <ResultReuse
            enabled={true}
            onChange={() => {}}
            query={mockQuery}
            newFormStylingEnabled={newFormStylingEnabled}
          />
        );
        const toggle = screen.getByLabelText('Enable');
        const ttlInput = screen.getByLabelText('TTL (mins)');

        expect(toggle).toBeEnabled();
        expect(ttlInput).toBeEnabled();
      });

      it('options should be disabled if `enabled=false`', () => {
        render(
          <ResultReuse
            enabled={false}
            onChange={() => {}}
            query={mockQuery}
            newFormStylingEnabled={newFormStylingEnabled}
          />
        );
        const toggle = screen.getByLabelText('Enable');
        const ttlInput = screen.getByLabelText('TTL (mins)');

        expect(toggle).toBeDisabled();
        expect(ttlInput).toBeDisabled();
      });

      it('should call `onChange` when toggle is clicked', () => {
        const onChange = jest.fn();
        render(
          <ResultReuse
            enabled={true}
            onChange={onChange}
            query={mockQuery}
            newFormStylingEnabled={newFormStylingEnabled}
          />
        );
        const toggle = screen.getByLabelText('Enable');

        fireEvent.click(toggle);

        expect(onChange).toHaveBeenCalledWith({
          ...mockQuery,
          connectionArgs: {
            ...mockQuery.connectionArgs,
            resultReuseEnabled: true,
          },
        });
      });

      it('should call `onChange` when TTL input is changed', () => {
        const onChange = jest.fn();
        render(
          <ResultReuse
            enabled={true}
            onChange={onChange}
            query={mockQuery}
            newFormStylingEnabled={newFormStylingEnabled}
          />
        );
        const ttlInput = screen.getByLabelText('TTL (mins)');

        fireEvent.change(ttlInput, { target: { value: '10' } });

        expect(onChange).toHaveBeenCalledWith({
          ...mockQuery,
          connectionArgs: {
            ...mockQuery.connectionArgs,
            resultReuseMaxAgeInMinutes: 10,
          },
        });
      });
    });
  }
  run('ResultReuse with awsDatasourcesNewFormStyling disabled', false);
  run('ResultReuse with awsDatasourcesNewFormStyling enabled', true);
});
