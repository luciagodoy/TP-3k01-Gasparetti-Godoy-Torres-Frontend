import Modelo from './Modelo';
import { Ciudad } from './ubicacion';
import { ROLES, ROLES_STAFF } from './tipos';

export class User extends Modelo {
  constructor({ id, username, email, role }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.username = username;
    /** @type {string} */ this.email = email;
    /** @type {import('./tipos').Rol} */ this.role = role;
  }

  get esAdmin() {
    return this.role === ROLES.ADMIN;
  }

  get esStaff() {
    return ROLES_STAFF.includes(this.role);
  }

  get esHuesped() {
    return this.role === ROLES.HUESPED;
  }
}

export class Huesped extends Modelo {
  constructor({ id, telefono, documentoIdentidad, ciudadId, pais, userId, usuario, ciudad }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string | null} */ this.telefono = telefono ?? null;
    /** @type {string} */ this.documentoIdentidad = documentoIdentidad;
    /** @type {number} */ this.ciudadId = ciudadId;
    /** @type {string} */ this.pais = pais;
    /** @type {number} */ this.userId = userId;
    /** @type {User | null} */ this.usuario = User.fromJSON(usuario);
    /** @type {Ciudad | null} */ this.ciudad = Ciudad.fromJSON(ciudad);
  }
}

export class Empleado extends Modelo {
  constructor({ id, nombre, apellido, email, telefono, puesto, estado }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.nombre = nombre;
    /** @type {string} */ this.apellido = apellido;
    /** @type {string} */ this.email = email;
    /** @type {string | null} */ this.telefono = telefono ?? null;
    /** @type {string} */ this.puesto = puesto;
    /** @type {import('./tipos').EstadoEmpleado} */ this.estado = estado;
  }

  get nombreCompleto() {
    return `${this.nombre} ${this.apellido}`;
  }

  get estaActivo() {
    return this.estado === 'activo';
  }
}
