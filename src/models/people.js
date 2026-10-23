import BaseModel from './BaseModel';
import { City } from './location';
import { ROLES, STAFF_ROLES } from './types';

export class User extends BaseModel {
  constructor({ id, username, email, role }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.username = username;
    /** @type {string} */ this.email = email;
    /** @type {import('./types').Role} */ this.role = role;
  }

  get isAdmin() {
    return this.role === ROLES.ADMIN;
  }
  get isStaff() {
    return STAFF_ROLES.includes(this.role);
  }

  get isGuest() {
    return this.role === ROLES.GUEST;
  }
}

export class Guest extends BaseModel {
  constructor({ id, phone, documentNumber, cityId, country, userId, user, city }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string | null} */ this.phone = phone ?? null;
    /** @type {string} */ this.documentNumber = documentNumber;
    /** @type {number} */ this.cityId = cityId;
    /** @type {string} */ this.country = country;
    /** @type {number} */ this.userId = userId;
    /** @type {User | null} */ this.user = User.fromJSON(user);
    /** @type {City | null} */ this.city = City.fromJSON(city);
  }
}

export class Employee extends BaseModel {
  constructor({ id, firstName, lastName, email, phone, position, status }) {
    super();
    /** @type {number} */ this.id = id;
    /** @type {string} */ this.firstName = firstName;
    /** @type {string} */ this.lastName = lastName;
    /** @type {string} */ this.email = email;
    /** @type {string | null} */ this.phone = phone ?? null;
    /** @type {string} */ this.position = position;
    /** @type {import('./types').EmployeeStatus} */ this.status = status;
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get isActive() {
    return this.status === 'activo';
  }
}
