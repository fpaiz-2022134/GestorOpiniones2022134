'use strict'



import {
    validateJwt
} from '../middleware/validate-jwt.js'

import express from 'express'

import {
    test,
    addCategory,
    getCategories,
    updateCategory,
    deleteCategory
} from './category.controller.js'

const api = express.Router()

api.get('/test', test)
api.post('/addCategory', [validateJwt], addCategory)
api.get('/getCategories', [validateJwt], getCategories)
api.put('/updateCategory/:id', [validateJwt], updateCategory)
api.delete('/deleteCategory/:id',[validateJwt], deleteCategory)


export default api