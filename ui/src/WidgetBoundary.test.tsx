import { cleanup, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WidgetBoundary, WidgetContent } from './WidgetBoundary';

function BrokenWidget(): ReactNode {
  throw new Error('widget exploded');
}

describe('WidgetBoundary', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('keeps the rest of the page when one widget throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <>
        <WidgetBoundary label="recent songs" className="activity-column">
          <BrokenWidget />
        </WidgetBoundary>
        <p>recent videos published</p>
      </>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent("couldn't load recent songs right now.");
    expect(screen.getByText('recent videos published')).toBeInTheDocument();
    expect(document.querySelector('.activity-column')).toBeInTheDocument();
  });

  it('catches a throw from widget content', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <WidgetBoundary label="recent videos">
        <WidgetContent
          render={() => {
            throw new Error('bad video');
          }}
        />
      </WidgetBoundary>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent("couldn't load recent videos right now.");
  });
});
