import "dotenv/config"
import app from "./app.js"
const PORT=process.env.PORT;

app.get("health",(req,res)=>{
  return res.json({
    success:true
  })
})

app.listen(PORT,()=>{
  console.log(`Backend server has begun at port ${PORT}`)
})
