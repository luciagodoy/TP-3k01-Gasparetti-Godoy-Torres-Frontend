// Las unidades de un servicio son enteras: 1.5 desayunos por día no se puede cobrar.
// Recibe el valor del input (string) o un número.
export const isValidQuantity = (value) => Number.isInteger(Number(value)) && Number(value) >= 1;
