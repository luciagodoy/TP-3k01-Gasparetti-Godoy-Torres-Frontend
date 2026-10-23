import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import GuestSelector from './GuestSelector';

function Harness({ initial = '', max = 4, onChange = () => {} }) {
  const [people, setPeople] = useState(initial);
  return (
    <GuestSelector
      id="people"
      name="people"
      value={people}
      max={max}
      onChange={(e) => {
        onChange(e);
        setPeople(e.target.value);
      }}
    />
  );
}

const trigger = () => screen.getByRole('button', { name: /habitación/i });
const open = () => fireEvent.click(trigger());

describe('GuestSelector', () => {
  it('summarises one room and one guest when nothing was chosen yet', () => {
    render(<Harness />);

    expect(trigger()).toHaveTextContent('1 habitación · 1 huésped');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the room panel and changes the number of guests with the steppers', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    open();

    expect(screen.getByRole('dialog', { name: 'Número de huéspedes' })).toHaveTextContent('Habitación 1');
    fireEvent.click(screen.getByRole('button', { name: 'Agregar un huésped' }));

    expect(onChange).toHaveBeenLastCalledWith({ target: { name: 'people', value: 2 } });
    expect(trigger()).toHaveTextContent('1 habitación · 2 huéspedes');
  });

  it('cannot go below one guest or above the largest room', () => {
    render(<Harness initial={2} max={2} />);
    open();
    const less = screen.getByRole('button', { name: 'Quitar un huésped' });
    const more = screen.getByRole('button', { name: 'Agregar un huésped' });

    expect(more).toBeDisabled();
    fireEvent.click(less);
    expect(less).toBeDisabled();
    expect(trigger()).toHaveTextContent('1 huésped');
  });

  it('closes with Escape and gives the focus back to the trigger', () => {
    render(<Harness />);
    open();
    expect(screen.getByRole('button', { name: 'Agregar un huésped' })).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
  });

  it('closes when clicking outside', () => {
    render(<Harness />);
    open();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
