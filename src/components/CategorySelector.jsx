import { useEffect, useId, useRef, useState } from 'react';
import '../styles/category-selector.scss';

export default function CategorySelector({ id, labelId, name, value, onChange, categories = [], allLabel = 'Todas' }) {
  const options = [
    { value: '', label: allLabel },
    ...categories.map((category) => ({ value: String(category.id), label: category.name })),
  ];
  const current = String(value ?? '');
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === current));
  const last = options.length - 1;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const containerRef = useRef(null);
  const optionRefs = useRef([]);
  const listId = useId();
  const optionId = (index) => `${listId}-option-${index}`;
  const active = Math.min(activeIndex, last);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) optionRefs.current[active]?.scrollIntoView?.({ block: 'nearest' });
  }, [open, active]);

  const openList = (index = selectedIndex) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const select = (index) => {
    const option = options[index];
    if (option && option.value !== current) onChange({ target: { name, value: option.value } });
    setOpen(false);
  };

  const findByCharacter = (character) => {
    const wanted = character.toLocaleLowerCase('es');
    const start = open ? active : selectedIndex;
    for (let step = 1; step <= options.length; step += 1) {
      const index = (start + step) % options.length;
      if (options[index].label.toLocaleLowerCase('es').startsWith(wanted)) return index;
    }
    return -1;
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
        return;
      }
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        openList(e.key === 'Home' ? 0 : last);
        return;
      }
    } else {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(Math.min(active + 1, last));
          return;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(Math.max(active - 1, 0));
          return;
        case 'Home':
          e.preventDefault();
          setActiveIndex(0);
          return;
        case 'End':
          e.preventDefault();
          setActiveIndex(last);
          return;
        case 'Enter':
        case ' ':
          e.preventDefault();
          select(active);
          return;
        case 'Escape':
          e.preventDefault();
          setOpen(false);
          return;
        case 'Tab':
          select(active);
          return;
        default:
          break;
      }
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const index = findByCharacter(e.key);
      if (index !== -1) openList(index);
    }
  };

  return (
    <div className="category-selector" ref={containerRef}>
      <div
        id={id}
        role="combobox"
        tabIndex={0}
        className="category-selector-trigger"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? optionId(active) : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
      >
        <span className="category-selector-value">{options[selectedIndex].label}</span>
        <svg className="category-selector-caret" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {open && (
        <ul id={listId} className="category-selector-list" role="listbox" aria-labelledby={labelId}>
          {options.map((option, index) => (
            <li
              key={option.value || 'all'}
              id={optionId(index)}
              ref={(element) => { optionRefs.current[index] = element; }}
              role="option"
              aria-selected={index === selectedIndex}
              className={`category-selector-option${index === active ? ' active' : ''}`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseMove={() => setActiveIndex(index)}
              onClick={() => select(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
