import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import CategorySelector from './CategorySelector';

const CATEGORIES = [
  { id: 1, name: 'Estándar' },
  { id: 2, name: 'Suite' },
  { id: 3, name: 'Superior' },
];

function Harness({ initial = '', onChange = () => {} }) {
  const [categoryId, setCategoryId] = useState(initial);
  return (
    <>
      <span id="category-label">Categoría</span>
      <CategorySelector
        id="category"
        labelId="category-label"
        name="categoryId"
        value={categoryId}
        categories={CATEGORIES}
        onChange={(e) => {
          onChange(e);
          setCategoryId(e.target.value);
        }}
      />
    </>
  );
}

const combobox = () => screen.getByRole('combobox', { name: 'Categoría' });
const activeOption = () => document.getElementById(combobox().getAttribute('aria-activedescendant'));

describe('CategorySelector', () => {
  it('shows "Todas" when no category is chosen and starts closed', () => {
    render(<Harness />);

    expect(combobox()).toHaveTextContent('Todas');
    expect(combobox()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens the list with a click and selects an option with the same contract as a <select>', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(combobox());

    expect(screen.getAllByRole('option')).toHaveLength(4);
    fireEvent.click(screen.getByRole('option', { name: 'Suite' }));

    expect(onChange).toHaveBeenLastCalledWith({ target: { name: 'categoryId', value: '2' } });
    expect(combobox()).toHaveTextContent('Suite');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('marks the current value as selected when reopened', () => {
    render(<Harness initial="3" />);
    fireEvent.click(combobox());

    expect(screen.getByRole('option', { name: 'Superior' })).toHaveAttribute('aria-selected', 'true');
    expect(activeOption()).toHaveTextContent('Superior');
  });

  it('is fully usable with the keyboard', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    fireEvent.keyDown(combobox(), { key: 'ArrowDown' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(activeOption()).toHaveTextContent('Todas');

    fireEvent.keyDown(combobox(), { key: 'ArrowDown' });
    fireEvent.keyDown(combobox(), { key: 'ArrowDown' });
    expect(activeOption()).toHaveTextContent('Suite');

    fireEvent.keyDown(combobox(), { key: 'Enter' });
    expect(onChange).toHaveBeenLastCalledWith({ target: { name: 'categoryId', value: '2' } });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('jumps to an option by its first letter', () => {
    render(<Harness />);

    fireEvent.keyDown(combobox(), { key: 's' });
    expect(activeOption()).toHaveTextContent('Suite');
    fireEvent.keyDown(combobox(), { key: 's' });
    expect(activeOption()).toHaveTextContent('Superior');
  });

  it('closes with Escape without changing the value', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.keyDown(combobox(), { key: 'ArrowDown' });
    fireEvent.keyDown(combobox(), { key: 'End' });

    fireEvent.keyDown(combobox(), { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
    expect(combobox()).toHaveTextContent('Todas');
  });

  it('closes when clicking outside', () => {
    render(<Harness />);
    fireEvent.click(combobox());

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
