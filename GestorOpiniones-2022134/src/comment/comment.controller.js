'use strict'

 import Comment from './comment.model.js'
import { checkUpdate } from '../utils/validator.js' 

//Testing
export const test = async (req, res) => {
      
    return res.send('Hello World ')
    
}


 export const createComment = async(req, res) =>{
    try {
        //Id of the user
        let {_id} = req.user
        //Getting the data
        let data = req.body
        //Checking the user by the token
        if(!_id) return res.status(404).send({message: 'User not found.'})
        //Setting the id into the author space.
        data.author = _id
        //Creating the comment
        let comment = await Comment(data)
        //Saving the comment
        comment = await comment.save()
        //Replying
        return res.status(200).send({message: 'Your comment has been posted'})

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error creating the comment' })
    }
}

//Getting all the comments

export const getComments = async(req, res)=>{
    try {
        let comments = await Comment.find().populate('author', ['name', 'email', '-_id']).populate('publication', ['title', '-_id'])
        return res.send(comments)
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting the comments' })
    }
}


export const getMyComments = async (req, res)=>{
    try {
        //Getting the id of the user
        let {_id} = req.user
        //Getting the comments
        let comments = await Comment.find({author: _id}).populate('author', ['name', 'email', '-_id']).populate('publication', ['title', '-_id'])
        return res.send(comments)
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting the comments' })
    }
}
export const updateComment = async(req,res)=>{
    try {
        //Getting the id of the comment
        let {id} = req.params
        //Getting the id of the user
        let {_id} = req.user
        //Getting the data
        let data = req.body
        //Searching the comment by id
        let comment = await Comment.findOne({_id: id})
        if (!comment) return res.status(404).send({message: 'Comment not found'})
        //Checking the user by the token
        if(!_id) return res.status(404).send({message: 'User not found.'})
        //Checking that the user is the author of the comment
        if(comment.author.toString()!== _id.toString()) return res.status(404).send({message: 'You are not the author of this comment'})
        //New validation, the user can't update the publication of the comment.
        if(data.publication != null) return res.status(400).send({message: 'You cannot update or change the publication commented.'})
        //Checking the update
        let update = checkUpdate(data, id)
        if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be update or missing' })

        //Updating the comment
        let updatedComment = await Comment.updateOne(
            {_id: id},
            data,
            {new: true}
        )
        if(!updatedComment) return res.status(404).send({message: 'Publication has not been updated.'})
        //Replying
        return res.status(200).send({message: 'Comment updated successfully.'})
    
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating the comment' })
    }
}

//DELETE for comments
export const deleteComment = async(req, res)=>{
    try {
        //Getting the id of the user
        let {_id} = req.user
        //Getting the id of the comment
        let {id} = req.params
        //Checking the user by the token
        if(!_id) return res.status(404).send({message: 'User not found.'})
        //Finding the comment by the id.
        let comment = await Comment.findOne({_id: id})
        if(!comment) return res.status(404).send({message: 'Comment not found.'})
        //Checking that the user is the author of the comment
        if(comment.author._id.toString() !== _id.toString()) return res.status(404).send({message: 'You are not the author of this comment'})
        //Deleting the comment
        let deletedComment = await Comment.findByIdAndDelete({_id: id})
        if(!deletedComment) return res.status(404).send({message: 'Comment has not been deleted.'})
        //Replying
        return res.status(200).send({message: 'Comment deleted successfully.'})
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting the comment' })
    }
} 