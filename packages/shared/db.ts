import {Pool} from "pg";
const pool=new Pool({
  connectionString:process.env.DB_URL
})

pool.connect()
  .then(()=>console.log(`Postgres is connected `))
  .catch((error)=>console.log(`Error connecting the postgres ${error?.message}`))

export default pool;