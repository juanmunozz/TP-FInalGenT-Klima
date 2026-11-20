import { describe,it,expect } from 'vitest';
import { overlaps,calculateCharge,canTransition } from '../src/domain.js';
describe('reglas de dominio Klima',()=>{
  it('detecta superposición parcial y total de visitas',()=>{
    const start=new Date('2030-01-01T10:00:00Z');
    expect(overlaps(start,60,new Date('2030-01-01T10:30:00Z'),30)).toBe(true);
    expect(overlaps(start,60,new Date('2030-01-01T11:00:00Z'),30)).toBe(false);
  });
  it('descuenta la visita una sola vez si se acepta la reparación',()=>{
    expect(calculateCharge(50000,5000,true,false)).toBe(45000);
    expect(()=>calculateCharge(50000,5000,true,true)).toThrow();
    expect(calculateCharge(50000,5000,false,false)).toBe(50000);
  });
  it('valida transiciones de estados',()=>{
    expect(canTransition('PENDIENTE','CONTACTADO')).toBe(true);
    expect(canTransition('CANCELADO','ACEPTADO')).toBe(false);
  });
});
