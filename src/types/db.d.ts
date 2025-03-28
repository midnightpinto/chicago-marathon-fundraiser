declare module '../../config/db' {
  import { Pool } from 'mysql2/promise';
  const pool: Pool;
  export = pool;
}