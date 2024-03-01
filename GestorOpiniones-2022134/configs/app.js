//Configuration of express

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import {config} from 'dotenv'

//Routes
import userRoutes from '../src/user/user.routes.js'
import publicationRoutes from '../src/publication/publication.routes.js'
import commentRoutes from '../src/comment/comment.routes.js'
import categoryRoutes from '../src/category/category.routes.js'

//Configurations
const app = express() //Creamos el servidor
config()


const port = process.env.PORT || 3200

// Configurating the server

app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(cors()) //Acepta o reniega las solicitudes.
app.use(helmet()) //Seguridad
app.use(morgan('dev'))

//Declaring the routes
app.use('/user', userRoutes)
app.use('/publication', publicationRoutes )
app.use('/comment', commentRoutes)
app.use('/category', categoryRoutes)

//Starting the server

export const initServer = ()=>{
    app.listen(port)
    console.log(`Server HTTP running in port ${port}`)
    
}
