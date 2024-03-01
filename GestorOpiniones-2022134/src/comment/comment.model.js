'use strict'

import { Schema, model } from "mongoose"

const commentSchema = new Schema ({
    text: {
        type: String,
        required: true
    },
    /* date:{
        type: Date,
        default: Date.now,
        required: false
    }, */
    publication: {
        type: Schema.Types.ObjectId,
        ref: 'publication',
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
})

export default model ('comment', commentSchema)
