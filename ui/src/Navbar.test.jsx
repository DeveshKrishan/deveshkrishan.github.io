import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Navbar from './Navbar';

describe('Navbar', () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
  });

  it('opens the mobile menu and closes it after a link is chosen', () => {
    render(<Navbar />);

    const toggle = screen.getByRole('button', { name: 'menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'close' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.click(screen.getByRole('link', { name: 'skills' }));
    expect(screen.getByRole('button', { name: 'menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('closes the mobile menu on Escape', () => {
    render(<Navbar />);

    fireEvent.click(screen.getByRole('button', { name: 'menu' }));
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.getByRole('button', { name: 'menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
