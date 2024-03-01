'use strict'

import jwt from 'jsonwebtoken'
import User from '../user/user.model.js'

export const validateJwt = async(req, res, next)=>{
    try{
        //Getting the key access
        let secretKey = process.env.SECRET_KEY
        //Getting the token of the headers
        let { token } = req.headers
        //Verifying the token
        if(!token) return res.status(401).send({message: 'Unauthorized'})
        //Getting the sent id
        let { uid } = jwt.verify(token, secretKey)
        //Checking if the user still exists in the DB
        let user = await User.findOne({_id: uid})
        if(!user) return res.status(404).send({message: 'User not found - Unauthorized'})
        //Ok of Middleware
        req.user = user
        next()
    }catch(err){
        console.error(err)
        return res.status(401).send({message: 'Invalid token or expired'})
    }
}