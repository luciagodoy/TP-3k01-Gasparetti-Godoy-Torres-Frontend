import { useState } from 'react';
import { employeeService } from '../services/resources';
import useQuery from '../hooks/useQuery';
import '../styles/pages.scss';

// Stored values (data), shown to the user as "Activo" / "Inactivo".
const EMPLOYEE_STATUS = { ACTIVE: 'activo', INACTIVE: 'inactivo' };

const emptyForm = { firstName: '', lastName: '', email: '', phone: '', position: '', status: EMPLOYEE_STATUS.ACTIVE };

export default function Employees() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: employees, refetch: fetchEmployees } = useQuery(
    '/employees',
    () => employeeService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const filteredEmployees = employees.filter((employee) => {
    const value = `${employee.fullName} ${employee.email} ${employee.position}`.toLowerCase();
    return searchTerm ? value.includes(searchTerm.toLowerCase()) : true;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.position.trim()) {
      setError('Nombre, apellido, email y puesto son requeridos.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        position: formData.position.trim(),
        status: formData.status,
      };
      if (editingId) {
        await employeeService.update(editingId, payload);
        setMessage('Empleado actualizado correctamente.');
      } else {
        await employeeService.create(payload);
        setMessage('Empleado creado correctamente.');
      }
      resetForm();
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position,
      status: employee.status,
    });
    setEditingId(employee.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este empleado? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await employeeService.remove(id);
      setMessage('Empleado eliminado correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Empleados</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nuevo Empleado'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="employee-first-name">Nombre</label>
              <input id="employee-first-name" type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Nombre" />
            </div>
            <div className="form-group">
              <label htmlFor="employee-last-name">Apellido</label>
              <input id="employee-last-name" type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Apellido" />
            </div>
            <div className="form-group">
              <label htmlFor="employee-email">Email</label>
              <input id="employee-email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="empleado@hotel.com" />
            </div>
            <div className="form-group">
              <label htmlFor="employee-phone">Teléfono</label>
              <input id="employee-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="123456789" />
            </div>
            <div className="form-group">
              <label htmlFor="employee-position">Puesto</label>
              <input id="employee-position" type="text" name="position" value={formData.position} onChange={handleChange} placeholder="Ej: Recepcionista" />
            </div>
            <div className="form-group">
              <label htmlFor="employee-status">Estado</label>
              <select id="employee-status" name="status" value={formData.status} onChange={handleChange}>
                <option value={EMPLOYEE_STATUS.ACTIVE}>Activo</option>
                <option value={EMPLOYEE_STATUS.INACTIVE}>Inactivo</option>
              </select>
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Empleados</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o puesto"
              aria-label="Buscar empleado por nombre, email o puesto"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Puesto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr
                key={employee.id}
                className={selected?.id === employee.id ? 'selected-row' : ''}
                onClick={() => setSelected(employee)}
              >
                <td>{employee.fullName}</td>
                <td>{employee.email}</td>
                <td>{employee.phone || '-'}</td>
                <td>{employee.position}</td>
                <td><span className={`badge badge-${employee.status}`}>{employee.status}</span></td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(employee); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(employee.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selected && (
          <div className="details-card">
            <h4>Detalle del empleado</h4>
            <p><strong>Nombre:</strong> {selected.fullName}</p>
            <p><strong>Email:</strong> {selected.email}</p>
            <p><strong>Teléfono:</strong> {selected.phone || '-'}</p>
            <p><strong>Puesto:</strong> {selected.position}</p>
            <p><strong>Estado:</strong> {selected.status}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>Cerrar detalle</button>
          </div>
        )}
      </div>
    </div>
  );
}
