import express from 'express'
import usersRoutes from './routes/usersRoutes.js'
import postsRoutes from "./routes/postsRoutes.js"

const PORT = 3000
const app = express()

app.use(express.json())

app.use("/users", usersRoutes)
app.use("/posts", postsRoutes)

app.listen(PORT, () => {
    console.log(`Server runs on port http://localhost:${PORT}`)
})