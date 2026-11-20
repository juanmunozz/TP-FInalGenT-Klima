import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from './db.js';
import { requireAdmin } from './auth.js';
import { REQUEST_STATES, canTransition, overlaps, calculateCharge } from './domain.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
app.use('/api/requests', rateLimit({ windowMs: 15*60*1000, limit: 20 }));
app.get('/api/health', (_req,res)=>res.json({status:'ok'}));
app.get('/api/services', async (_req,res,next)=>{ try { const q=await pool.query('SELECT id,name,description,suggested_duration_minutes FROM service_types WHERE active=true ORDER BY id'); res.json(q.rows); } catch(e){next(e);} });

const requestSchema=z.object({name:z.string().trim().min(2).max(100),phone:z.string().trim().min(6).max(40),email:z.string().email().max(150).optional().or(z.literal('')),zone:z.string().trim().min(2).max(100),service:z.string().trim().min(2).max(100),description:z.string().trim().min(10).max(2000)});
app.post('/api/requests', async (req,res,next)=>{
  const parsed=requestSchema.safeParse(req.body); if(!parsed.success) return res.status(400).json({error:'Revisá los campos obligatorios.',details:parsed.error.flatten()});
  const c=parsed.data;
  const client=await pool.connect();
  try {
    await client.query('BEGIN');
    const customer=await client.query('INSERT INTO customers(name,phone,email,zone) VALUES($1,$2,$3,$4) RETURNING id',[c.name,c.phone,c.email||null,c.zone]);
    const service=await client.query('SELECT id FROM service_types WHERE name=$1 AND active=true',[c.service]);
    if(!service.rowCount){await client.query('ROLLBACK');return res.status(400).json({error:'El servicio seleccionado no está disponible.'});}
    const created=await client.query("INSERT INTO service_requests(customer_id,service_type_id,description) VALUES($1,$2,$3) RETURNING id,status,created_at",[customer.rows[0].id,service.rows[0].id,c.description]);
    await client.query('COMMIT'); res.status(201).json(created.rows[0]);
  } catch(e){await client.query('ROLLBACK');next(e);} finally{client.release();}
});

app.post('/api/auth/login', async (req,res)=>{
  const parsed=z.object({email:z.string().email(),password:z.string().min(1)}).safeParse(req.body);
  if(!parsed.success) return res.status(400).json({error:'Ingresá email y contraseña válidos.'});
  try {
    const q=await pool.query('SELECT id,email,password_hash FROM admins WHERE email=$1',[parsed.data.email.toLowerCase()]);
    if(!q.rowCount || !(await bcrypt.compare(parsed.data.password,q.rows[0].password_hash))) return res.status(401).json({error:'Credenciales incorrectas.'});
    const secret=process.env.JWT_SECRET; if(!secret) return res.status(500).json({error:'Falta configurar JWT_SECRET.'});
    res.json({token:jwt.sign({id:q.rows[0].id,email:q.rows[0].email},secret,{expiresIn:'8h'})});
  } catch { res.status(500).json({error:'No se pudo iniciar sesión.'}); }
});
app.get('/api/admin/requests',requireAdmin,async (_req,res,next)=>{try{const q=await pool.query(`SELECT r.id,c.name AS customer_name,c.phone,c.email,c.zone,s.name AS service_name,r.description,r.status,r.created_at FROM service_requests r JOIN customers c ON c.id=r.customer_id JOIN service_types s ON s.id=r.service_type_id ORDER BY r.created_at DESC`);res.json(q.rows);}catch(e){next(e);}});
app.patch('/api/admin/requests/:id/status',requireAdmin,async(req,res,next)=>{
  const id=Number(req.params.id), parsed=z.object({status:z.enum(REQUEST_STATES)}).safeParse(req.body);
  if(!Number.isInteger(id)||id<=0||!parsed.success)return res.status(400).json({error:'Datos inválidos.'});
  try{const q=await pool.query('SELECT status FROM service_requests WHERE id=$1',[id]);if(!q.rowCount)return res.status(404).json({error:'Solicitud inexistente.'});if(!canTransition(q.rows[0].status,parsed.data.status))return res.status(409).json({error:'Transición de estado no permitida.'});const updated=await pool.query('UPDATE service_requests SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING id,status',[parsed.data.status,id]);res.json(updated.rows[0]);}catch(e){next(e);}
});
app.get('/api/admin/appointments',requireAdmin,async(_req,res,next)=>{try{const q=await pool.query(`SELECT a.*,c.name AS customer_name,s.name AS service_name FROM appointments a JOIN service_requests r ON r.id=a.request_id JOIN customers c ON c.id=r.customer_id JOIN service_types s ON s.id=r.service_type_id ORDER BY starts_at`);res.json(q.rows);}catch(e){next(e);}});
app.post('/api/admin/appointments',requireAdmin,async(req,res,next)=>{
  const p=z.object({requestId:z.number().int().positive(),startsAt:z.string().datetime(),durationMinutes:z.number().int().positive().max(720),resourceName:z.string().trim().min(1).max(80).default('KLIMA')}).safeParse(req.body);
  if(!p.success)return res.status(400).json({error:'Datos de visita inválidos.'});
  const start=new Date(p.data.startsAt);if(start.getTime()<=Date.now())return res.status(400).json({error:'No se pueden confirmar visitas en el pasado.'});
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const reqRow=await client.query('SELECT status FROM service_requests WHERE id=$1 FOR UPDATE',[p.data.requestId]);
    if(!reqRow.rowCount||reqRow.rows[0].status==='CANCELADO'){await client.query('ROLLBACK');return res.status(409).json({error:'La solicitud no existe o está cancelada.'});}
    // Lock table rows for this resource to serialize checks; use transaction-scoped advisory lock.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[p.data.resourceName]);
    const existing=await client.query("SELECT starts_at,duration_minutes FROM appointments WHERE resource_name=$1 AND status='CONFIRMADA' FOR UPDATE",[p.data.resourceName]);
    const conflict=existing.rows.some(x=>overlaps(start,p.data.durationMinutes,new Date(x.starts_at),x.duration_minutes));
    if(conflict){await client.query('ROLLBACK');return res.status(409).json({error:'Ese horario se superpone con otra visita confirmada.'});}
    const created=await client.query("INSERT INTO appointments(request_id,resource_name,starts_at,duration_minutes) VALUES($1,$2,$3,$4) RETURNING *",[p.data.requestId,p.data.resourceName,start,p.data.durationMinutes]);
    await client.query('UPDATE service_requests SET status=\'ACEPTADO\',updated_at=NOW() WHERE id=$1',[p.data.requestId]);
    await client.query('COMMIT');res.status(201).json(created.rows[0]);
  }catch(e){await client.query('ROLLBACK');next(e);}finally{client.release();}
});
app.post('/api/admin/jobs',requireAdmin,async(req,res,next)=>{
  const p=z.object({appointmentId:z.number().int().positive(),outcome:z.enum(['TRABAJO_REALIZADO','REQUIERE_PRESUPUESTO','REQUIERE_REPUESTO','CLIENTE_NO_ACEPTA','NO_REALIZADO']),description:z.string().trim().max(3000),totalAmountArs:z.number().int().nonnegative(),visitChargeArs:z.number().int().nonnegative().default(0),acceptedRepair:z.boolean().default(false),finish:z.boolean().default(false)}).safeParse(req.body);
  if(!p.success)return res.status(400).json({error:'Datos de trabajo inválidos.'});
  if(p.data.finish&&p.data.description.length<5)return res.status(400).json({error:'Para finalizar, describí el trabajo realizado.'});
  try{
    const ap=await pool.query('SELECT id,status FROM appointments WHERE id=$1',[p.data.appointmentId]);if(!ap.rowCount)return res.status(404).json({error:'Visita inexistente.'});
    const existing=await pool.query('SELECT visit_charge_discounted FROM jobs WHERE appointment_id=$1',[p.data.appointmentId]);
    const already=existing.rowCount?existing.rows[0].visit_charge_discounted:false;
    let finalAmount:number;try{finalAmount=calculateCharge(p.data.totalAmountArs,p.data.visitChargeArs,p.data.acceptedRepair,already);}catch(e){return res.status(409).json({error:e instanceof Error?e.message:'No se pudo calcular el importe.'});}
    const discounted=p.data.acceptedRepair&&p.data.visitChargeArs>0;
    const q=await pool.query(`INSERT INTO jobs(appointment_id,outcome,description,total_amount_ars,visit_charge_ars,visit_charge_discounted,finished_at)
      VALUES($1,$2,$3,$4,$5,$6,CASE WHEN $7 THEN NOW() ELSE NULL END)
      ON CONFLICT(appointment_id) DO UPDATE SET outcome=EXCLUDED.outcome,description=EXCLUDED.description,total_amount_ars=EXCLUDED.total_amount_ars,visit_charge_ars=EXCLUDED.visit_charge_ars,visit_charge_discounted=EXCLUDED.visit_charge_discounted,finished_at=EXCLUDED.finished_at RETURNING *`,
      [p.data.appointmentId,p.data.outcome,p.data.description,finalAmount,p.data.visitChargeArs,discounted,p.data.finish]);
    if(p.data.finish)await pool.query("UPDATE appointments SET status='COMPLETADA' WHERE id=$1",[p.data.appointmentId]);
    res.status(201).json(q.rows[0]);
  }catch(e){next(e);}
});
app.get('/api/admin/customers/:id/history',requireAdmin,async(req,res,next)=>{const id=Number(req.params.id);if(!Number.isInteger(id)||id<=0)return res.status(400).json({error:'ID inválido.'});try{const q=await pool.query(`SELECT r.id,r.status,r.created_at,r.description,s.name AS service_name,a.starts_at,a.status AS appointment_status,j.outcome,j.description AS job_description,j.total_amount_ars FROM service_requests r JOIN service_types s ON s.id=r.service_type_id LEFT JOIN appointments a ON a.request_id=r.id LEFT JOIN jobs j ON j.appointment_id=a.id WHERE r.customer_id=$1 ORDER BY r.created_at DESC`,[id]);res.json(q.rows);}catch(e){next(e);}});
app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{console.error(err);res.status(500).json({error:'Ocurrió un error interno.'});});
