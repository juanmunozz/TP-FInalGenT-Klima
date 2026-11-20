export const REQUEST_STATES = ['PENDIENTE','CONTACTADO','ACEPTADO','CANCELADO'] as const;
export type RequestState = typeof REQUEST_STATES[number];
export function overlaps(aStart: Date, aDuration: number, bStart: Date, bDuration: number): boolean {
  const aEnd = aStart.getTime() + aDuration * 60000;
  const bEnd = bStart.getTime() + bDuration * 60000;
  return aStart.getTime() < bEnd && bStart.getTime() < aEnd;
}
export function calculateCharge(total: number, visitCharge: number, accepted: boolean, alreadyDiscounted: boolean) {
  if (![total, visitCharge].every(Number.isSafeInteger) || total < 0 || visitCharge < 0) throw new Error('Importes inválidos.');
  if (accepted && alreadyDiscounted) throw new Error('El descuento de visita ya fue aplicado.');
  return accepted ? Math.max(0, total - visitCharge) : total;
}
export function canTransition(from: RequestState, to: RequestState): boolean {
  const allowed: Record<RequestState, RequestState[]> = {
    PENDIENTE:['CONTACTADO','ACEPTADO','CANCELADO'],
    CONTACTADO:['ACEPTADO','CANCELADO'],
    ACEPTADO:['CANCELADO'],
    CANCELADO:[]
  };
  return allowed[from].includes(to);
}
