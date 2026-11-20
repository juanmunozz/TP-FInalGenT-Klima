import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { app } from './app.js';
import { pool } from './db.js';
const port=Number(process.env.PORT||3000);
async function main(){
  if(process.env.INITIAL_ADMIN_EMAIL&&process.env.INITIAL_ADMIN_PASSWORD){
    const email=process.env.INITIAL_ADMIN_EMAIL.toLowerCase();
    const existing=await pool.query('SELECT id FROM admins WHERE email=$1',[email]);
    if(!existing.rowCount){const hash=await bcrypt.hash(process.env.INITIAL_ADMIN_PASSWORD,12);await pool.query('INSERT INTO admins(email,password_hash) VALUES($1,$2)',[email,hash]);}
  }
  app.listen(port,()=>console.log(`Klima API escuchando en ${port}`));
}
main().catch(e=>{console.error(e);process.exit(1);});
