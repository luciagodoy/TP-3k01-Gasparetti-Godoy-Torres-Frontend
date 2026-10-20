import { useState } from 'react';
import { pricingRuleService, roomCategoryService } from '../services/resources';
import { ADJUSTMENT_TYPE, PRICING_RULE_TYPE } from '../models';
import useQuery from '../hooks/useQuery';
import '../styles/pages.scss';

const emptyForm = {
  type: PRICING_RULE_TYPE.OCCUPANCY,
  from: '',
  to: '',
  adjustmentType: ADJUSTMENT_TYPE.PERCENTAGE,
  value: '',
  categoryId: '',
  active: true,
};

// Revenue management: tiers that raise or lower the nightly price of a category
// depending on its occupancy that night and on how far ahead the guest books.
export default function PricingRules() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: rules, refetch: fetchRules } = useQuery(
    '/pricing-rules',
    () => pricingRuleService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const { data: categories } = useQuery(
    '/room-categories',
    () => roomCategoryService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const filteredRules = rules.filter((rule) => (typeFilter ? rule.type === typeFilter : true));
  const isOccupancy = formData.type === PRICING_RULE_TYPE.OCCUPANCY;
  const unit = isOccupancy ? '%' : 'días';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (formData.from === '' || formData.value === '') {
      setError('"Desde" y el valor del ajuste son requeridos.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type: formData.type,
        from: Number(formData.from),
        to: formData.to === '' ? null : Number(formData.to),
        adjustmentType: formData.adjustmentType,
        value: parseFloat(formData.value),
        categoryId: formData.categoryId === '' ? null : Number(formData.categoryId),
        active: formData.active,
      };
      if (editingId) {
        await pricingRuleService.update(editingId, payload);
        setMessage('Regla actualizada correctamente.');
      } else {
        await pricingRuleService.create(payload);
        setMessage('Regla creada correctamente.');
      }
      resetForm();
      fetchRules();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule) => {
    setFormData({
      type: rule.type,
      from: rule.from,
      to: rule.to ?? '',
      adjustmentType: rule.adjustmentType,
      value: rule.value,
      categoryId: rule.categoryId ?? '',
      active: rule.active,
    });
    setEditingId(rule.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta regla de tarifa? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await pricingRuleService.remove(id);
      setMessage('Regla eliminada correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchRules();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Tarifas Dinámicas</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nueva Regla'}
        </button>
      </div>

      <p className="page-intro">
        El precio de cada noche parte del precio base de la categoría y se ajusta según la ocupación
        de esa categoría esa noche y los días que faltan para el check-in. Si aplican las dos reglas,
        los porcentajes se multiplican: +30% y luego −10% da +17%. Ninguna combinación baja el precio
        de la mitad del precio base. Las reservas ya hechas conservan su precio.
      </p>

      {message && <div role="status" className="alert alert-success">{message}</div>}
      {error && <div role="alert" className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="rule-type">Mide</label>
              <select id="rule-type" name="type" value={formData.type} onChange={handleChange}>
                <option value={PRICING_RULE_TYPE.OCCUPANCY}>Ocupación de la categoría (%)</option>
                <option value={PRICING_RULE_TYPE.LEAD_TIME}>Antelación (días hasta el check-in)</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="rule-from">Desde ({unit}, inclusive)</label>
              <input id="rule-from" type="number" min="0" step="1" name="from" value={formData.from} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="rule-to">Hasta ({unit}, sin incluir — vacío = sin tope)</label>
              <input id="rule-to" type="number" min="0" step="1" name="to" value={formData.to} onChange={handleChange} />
              {isOccupancy && <p className="field-hint">Para el peldaño más alto dejalo vacío, así incluye el 100%.</p>}
            </div>
            <div className="form-group">
              <label htmlFor="rule-adjustment-type">Tipo de ajuste</label>
              <select id="rule-adjustment-type" name="adjustmentType" value={formData.adjustmentType} onChange={handleChange}>
                <option value={ADJUSTMENT_TYPE.PERCENTAGE}>Porcentaje</option>
                <option value={ADJUSTMENT_TYPE.FIXED}>Monto fijo por noche</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="rule-value">Valor (negativo = descuento)</label>
              <input id="rule-value" type="number" step="0.01" name="value" value={formData.value} onChange={handleChange} placeholder="Ej: 30 o -10" />
            </div>
            <div className="form-group">
              <label htmlFor="rule-category">Categoría</label>
              <select id="rule-category" name="categoryId" value={formData.categoryId} onChange={handleChange}>
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <p className="field-hint">Una regla de la categoría tiene prioridad sobre una general del mismo rango.</p>
            </div>
            <div className="form-group form-group-inline">
              <input id="rule-active" type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
              <label htmlFor="rule-active">Activa</label>
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Reglas</h3>
          <div className="filter-row">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filtrar por tipo de regla">
              <option value="">Todos los tipos</option>
              <option value={PRICING_RULE_TYPE.OCCUPANCY}>Ocupación</option>
              <option value={PRICING_RULE_TYPE.LEAD_TIME}>Antelación</option>
            </select>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Mide</th>
              <th>Rango</th>
              <th>Ajuste</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map((rule) => (
              <tr
                key={rule.id}
                className={selected?.id === rule.id ? 'selected-row' : ''}
                onClick={() => setSelected(rule)}
              >
                <td>{rule.typeLabel}</td>
                <td>{rule.rangeLabel}</td>
                <td>{rule.adjustmentLabel}</td>
                <td>{rule.scopeLabel}</td>
                <td>{rule.active ? 'Activa' : 'Inactiva'}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); setSelected(rule); }}>
                    Ver detalle
                  </button>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(rule); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(rule.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRules.length === 0 && <p>No hay reglas: todas las noches se cobran al precio base de su categoría.</p>}

        {selected && (
          <div className="details-card">
            <h4>Detalle de la regla</h4>
            <p><strong>ID:</strong> {selected.id}</p>
            <p><strong>Mide:</strong> {selected.typeLabel}</p>
            <p><strong>Rango:</strong> {selected.rangeLabel}</p>
            <p><strong>Ajuste:</strong> {selected.adjustmentLabel}</p>
            <p><strong>Categoría:</strong> {selected.scopeLabel}</p>
            <p><strong>Estado:</strong> {selected.active ? 'Activa' : 'Inactiva'}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
