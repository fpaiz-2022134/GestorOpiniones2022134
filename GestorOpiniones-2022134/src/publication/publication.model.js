'use strict'

import {Schema, model} from 'mongoose'

const publicationSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    category:{
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    mainText:{
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
})

export default model('publication', publicationSchema) 