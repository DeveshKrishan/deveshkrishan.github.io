import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { formatPhotoCaption, PHOTOS } from './data/photos';
import { Photos } from './Photos';

describe('Photos', () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
  });

  it('shows low-res thumbs and keeps full files out of the strip', () => {
    render(<Photos />);

    const block = document.getElementById('photos');
    expect(block).not.toBeNull();
    const thumbs = within(block as HTMLElement).getAllByRole('img');

    expect(thumbs).toHaveLength(6);
    for (const thumb of thumbs) {
      expect(thumb).toHaveAttribute('src', expect.stringContaining('/thumbs/'));
    }

    fireEvent.click(screen.getByRole('button', { name: 'next' }));
    expect(within(block as HTMLElement).getAllByRole('img')).toHaveLength(PHOTOS.length - 6);
    expect(within(block as HTMLElement).getByRole('list').children).toHaveLength(6);
  });

  it('opens a fullscreen viewer and steps through the roll', () => {
    render(<Photos />);

    fireEvent.click(screen.getByRole('button', { name: PHOTOS[0].alt }));
    expect(screen.getByRole('dialog', { name: formatPhotoCaption(PHOTOS[0]) })).toBeInTheDocument();
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByRole('dialog', { name: formatPhotoCaption(PHOTOS[1]) })).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: PHOTOS[2].alt }));
    expect(screen.getByRole('dialog', { name: formatPhotoCaption(PHOTOS[2]) })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'zoom in' }));
    expect(document.querySelector('[data-zoom="2"]')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'zoom in' }));
    expect(document.querySelector('[data-zoom="3"]')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'zoom out' }));
    expect(document.querySelector('[data-zoom="2"]')).not.toBeNull();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });

  it('shows a location-only caption and closes from the x', () => {
    render(<Photos />);

    fireEvent.click(screen.getByRole('button', { name: PHOTOS[0].alt }));
    const dialog = screen.getByRole('dialog', { name: formatPhotoCaption(PHOTOS[0]) });
    expect(within(dialog).getByText(formatPhotoCaption(PHOTOS[0]))).toBeInTheDocument();
    expect(within(dialog).queryByText(/\d{4}|am|pm/)).not.toBeInTheDocument();

    const strip = within(dialog).getByRole('list', { name: 'All photos' });
    for (const thumb of within(strip).getAllByRole('img')) {
      expect(thumb).toHaveAttribute('src', expect.stringContaining('/thumbs/'));
    }

    fireEvent.click(within(dialog).getByRole('button', { name: 'close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the horses frame from page 2 with the half moon bay caption', () => {
    const horses = PHOTOS.find((photo) => photo.id === '100_0083');
    expect(horses).toBeDefined();

    render(<Photos />);
    fireEvent.click(screen.getByRole('button', { name: 'next' }));
    fireEvent.click(screen.getByRole('button', { name: horses!.alt }));

    expect(
      screen.getByRole('dialog', { name: 'half moon bay beach, half moon bay, ca' }),
    ).toBeInTheDocument();
  });

  it('zooms with the keyboard and resets to 1x', () => {
    render(<Photos />);
    fireEvent.click(screen.getByRole('button', { name: PHOTOS[0].alt }));

    fireEvent.keyDown(window, { key: '+' });
    expect(document.querySelector('[data-zoom="2"]')).not.toBeNull();
    fireEvent.keyDown(window, { key: '+' });
    expect(document.querySelector('[data-zoom="3"]')).not.toBeNull();
    fireEvent.keyDown(window, { key: '0' });
    expect(document.querySelector('[data-zoom="1"]')).not.toBeNull();
  });

  it('uses chevron icons for the pager', () => {
    render(<Photos />);

    const next = screen.getByRole('button', { name: 'next' });
    expect(next.querySelector('svg')).not.toBeNull();
    expect(next).not.toHaveTextContent(/next|previous/i);
  });
});
