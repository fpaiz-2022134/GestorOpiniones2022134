'use strict'


import User from '../user/user.model.js'
import jwt from 'jsonwebtoken'

import bcrypt from 'bcrypt';
const { compare } = bcrypt;

import { generateJwt } from '../utils/jwt.js'

import {
    encrypt,
    checkPassword,
    checkUpdate
} from '../utils/validator.js'


//Testing
export const test = async (req, res) => {
    return res.send('Hello World ')
}


//Register

export const register = async (req, res) => {
    try {
        //User information
        let data = req.body
        //Encrypting the password
        data.password = await encrypt(data.password)
        //Rol by defect of the client
        data.role = 'CLIENT'
        //Object of user
        let user = await User(data)
        //Save the user
        await user.save()
        return res.status(200).send({
            message: 'User registered successfully.'
        })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error registering user' })
    }
}

//Login


export const login = async (req, res) => {
    try {
        //Capturing the information from the body.
        let { username, email, password } = req.body

        //Checking that the user has send the username or the email
        if (!username && !email) return res.status(400).send({ message: 'We need your username or email to login.' })

        let user = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        })

        if (!user) return res.status(404).send({ message: 'User not found' })
        //Checking the password
        if (user && await checkPassword(password, user.password)) {
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
            //Generate the token
            let token = await generateJwt(loggedUser)
            //Respond (dar acceso)
            return res.send(
                {
                    message: `Welcome ${user.name}`,
                    loggedUser,
                    token
                }
            )
        }
        return res.status(404).send({ message: 'Invalid credentials' })
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error logging in' })
    }
}

//Get my user

export const getMyUser = async (req, res) => {
    try {
        //Getting the id by the token
        let { _id } = req.user
        //Getting the user
        let user = await User.findOne({ _id: _id })

        //Validation of the user
        if (!user) return res.status(404).send({ message: 'User not found' })

        return res.status(200).send(user)

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting the user' })
    }
}


//Update

export const update = async (req, res) => {
    try {
        //Getting t
        let { id } = req.params
        //Getting the id by the token
        let { _id } = req.user
        //Getting the data
        let data = req.body
        //Validating that only the user can update himself.
        if(id !=_id) return res.status(401).send({message: 'You do not have permission to update another user.'})

        //Validating that the user can not update the password, only basic information.
        if(data.password != null) return res.status(400).send({message:'You cannot update the password here'})

        let update = checkUpdate(data, _id)

        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be update or missing' })

        //Updating the user
        let udpatedUser = await User.updateOne(
            { _id: _id },
            data,
            { new: true }
        )

        //Validation of the updated action
        if (!udpatedUser) return res.status(404).send({ message: 'User not found' })

        return res.status(200).send({ message: 'User updated successfully.' })

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating the user' })
    }
}


export const updatePassword = async (req, res) => {
    try {
        //Getting the id by the params
        let { id } = req.params
        //Getting the id of the user
        let { _id } = req.user
        //Getting the last and new password
        let data = req.body
        //Validating that only the user can update himself.
        if(id !=_id) return res.status(401).send({message: 'You do not have permission to update another user.'})
        //Validating that the user could send only the last and new password
        if (data.name != null || data.surname != null || data.email != null || data.phone != null || data.address != null)
            return res.status(400).send({ message: 'You can only change your password' })

        //Finding the user
        let userFound = await User.findOne({ _id })
        console.log(userFound)

        const isLastPasswordCorrect = await bcrypt.compare(data.lastPassword, userFound.password);

        //Validating the last and new password
        if (isLastPasswordCorrect) {
            //Encrypting the password
            data.password = await encrypt(data.password)
            let update = checkUpdate(data, _id)
            if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be update or missing' })

            //Updating the user
            let udpatedUser = await User.updateOne(
                { _id: _id },
                data,
                { new: true }
            )

            //Validation of the updated action
            if (!udpatedUser) return res.status(404).send({ message: 'User not found' })

            return res.status(200).send({ message: 'User updated successfully.' })
        }else{
            return res.status(400).send({ message: 'Your last password is not correct.' });
        }

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating the user' })
    }
}
