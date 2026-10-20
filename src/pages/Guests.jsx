import { useState } from 'react';
import { guestService } from '../services/resources';
import useQuery from '../hooks/useQuery';
import LocationSelector from '../components/LocationSelector';
import '../styles/pages.scss';

const emptyForm = {
  username: '',
  email: '',
  password: '',
  phone: '',
  documentNumber: '',
  cityId: '',
  country: 'Argentina',
};

export default function Guests() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  const { data: guests, refetch: fetchGuests } = useQuery(
    '/guests',
    () => guestService.list(),
    { initialData: [], onError: (err) => setError(err.message) }
  );

  const filteredGuests = guests.filter((guest) => {
    const searchValue = `${guest.user?.username || ''} ${guest.user?.email || ''} ${guest.documentNumber || ''} ${guest.city?.name || ''}`.toLowerCase();
    return searchTerm ? searchValue.includes(searchTerm.toLowerCase()) : true;
  });

  const handleInputChange = (e) => {
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

    if (editingId) {
      if (!formData.documentNumber || !formData.cityId) {
        setError('Completa todos los campos requeridos.');
        return;
      }
      setLoading(true);
      try {
        await guestService.update(editingId, {
          phone: formData.phone || null,
          documentNumber: formData.documentNumber,
          cityId: Number(formData.cityId),
          country: formData.country,
        });
        setMessage('Huésped actualizado correctamente.');
        resetForm();
        fetchGuests();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!formData.username || !formData.email || !formData.password || !formData.documentNumber || !formData.cityId) {
      setError('Completa todos los campos requeridos.');
      return;
    }

    setLoading(true);
    try {
      await guestService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || null,
        documentNumber: formData.documentNumber,
        cityId: Number(formData.cityId),
        country: formData.country,
      });
      setMessage('Huésped creado correctamente.');
      resetForm();
      fetchGuests();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este huésped? Esta acción no se puede deshacer.')) return;
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await guestService.remove(id);
      setMessage('Huésped eliminado correctamente.');
      if (selected?.id === id) setSelected(null);
      fetchGuests();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (guest) => {
    setFormData({
      username: guest.user?.username || '',
      email: guest.user?.email || '',
      password: '',
      phone: guest.phone || '',
      documentNumber: guest.documentNumber,
      cityId: guest.cityId ?? guest.city?.id ?? '',
      country: guest.country || 'Argentina',
    });
    setEditingId(guest.id);
    setShowForm(true);
    setMessage(null);
    setError(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gestión de Huéspedes</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? 'Cancelar' : '+ Nuevo Huésped'}
        </button>
      </div>

      {message && <div role="status" className="alert alert-success">{message}</div>}
      {error && <div role="alert" className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            {/* The account fields only apply on creation: they belong to the user, not the guest profile. */}
            {!editingId && (
              <>
                <div className="form-group">
                  <label htmlFor="guest-username">Usuario</label>
                  <input id="guest-username" type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="Nombre de usuario" />
                </div>
                <div className="form-group">
                  <label htmlFor="guest-email">Email</label>
                  <input id="guest-email" type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="juan@example.com" />
                </div>
                <div className="form-group">
                  <label htmlFor="guest-password">Contraseña</label>
                  <input id="guest-password" type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Contraseña" />
                </div>
              </>
            )}
            <div className="form-group">
              <label htmlFor="guest-phone">Teléfono</label>
              <input id="guest-phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="123456789" />
            </div>
            <div className="form-group">
              <label htmlFor="guest-document">Documento de Identidad</label>
              <input id="guest-document" type="text" name="documentNumber" value={formData.documentNumber} onChange={handleInputChange} placeholder="12345678" />
            </div>
            <LocationSelector
              cityId={formData.cityId}
              onChange={(cityId) => setFormData((prev) => ({ ...prev, cityId }))}
            />
            <div className="form-group">
              <label htmlFor="guest-country">País</label>
              <input id="guest-country" type="text" name="country" value={formData.country} onChange={handleInputChange} placeholder="País" />
            </div>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </form>
        </div>
      )}

      <div className="list-container">
        <div className="list-header">
          <h3>Huéspedes</h3>
          <div className="filter-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email, documento o ciudad"
              aria-label="Buscar huésped por nombre, email, documento o ciudad"
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Documento</th>
              <th>Ciudad / Provincia / País</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map((guest) => (
              <tr
                key={guest.id}
                className={selected?.id === guest.id ? 'selected-row' : ''}
                onClick={() => setSelected(guest)}
              >
                <td>{guest.user?.username}</td>
                <td>{guest.user?.email}</td>
                <td>{guest.phone || '-'}</td>
                <td>{guest.documentNumber}</td>
                <td>{guest.city?.name} / {guest.city?.province?.name} / {guest.country}</td>
                <td>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); setSelected(guest); }}>
                    Ver detalle
                  </button>
                  <button className="btn btn-small" onClick={(e) => { e.stopPropagation(); handleEdit(guest); }}>
                    Editar
                  </button>
                  <button className="btn btn-small btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(guest.id); }} disabled={loading}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selected && (
          <div className="details-card">
            <h4>Detalle del huésped seleccionado</h4>
            <p><strong>ID:</strong> {selected.id}</p>
            <p><strong>Usuario:</strong> {selected.user?.username}</p>
            <p><strong>Email:</strong> {selected.user?.email}</p>
            <p><strong>Teléfono:</strong> {selected.phone || '-'}</p>
            <p><strong>Documento:</strong> {selected.documentNumber}</p>
            <p><strong>Ciudad:</strong> {selected.city?.name}</p>
            <p><strong>Provincia:</strong> {selected.city?.province?.name}</p>
            <p><strong>País:</strong> {selected.country}</p>
            <button className="btn btn-secondary" onClick={() => setSelected(null)}>
              Cerrar detalle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
