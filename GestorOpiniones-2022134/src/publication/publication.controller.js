'use strict'
import Comment from '../comment/comment.model.js'
import Publication from './publication.model.js'
import { checkUpdate } from '../utils/validator.js'

export const createPost = async(req, res) =>{
    try {
        //Id of the user
        let {_id} = req.user
        //Getting the data
        let data = req.body
        //Checking that the user exists by the id
        if(!_id) return res.status(404).send({message: 'User not found.'})

        //Asign the author by the id of the token
        data.author = _id
        //Creating the publication
        let publication = await Publication(data)
        //Saving the publication
        publication = await publication.save()
        //Replying
        return res.status(200).send({message: 'Your publication has been posted'})
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error creating publication' })
    }
}

export const getPosts = async(req, res)=>{
    try {
        const posts = await Publication.find().populate('author', ['name', 'email','-_id']).populate('category', ['title', '-_id'])
        return res.send(posts)
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error getting the posts' })
    }
}

export const getMyPosts =async(req, res)=>{
    try{
        
        let data = req.body

        const posts = await Publication.find({author: data.author}) 
        console.log(posts)
        for (let i = 0; i < posts.length; i++) {
            let comments = await Comment.find({publication: posts._id}).populate('publication', ['title', 'category', 'mainText','author']).populate('author', ['name', 'email'])
            return res.send(comments) 
        }
        
        /* return res.send([posts, comments]) */
        
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'Error getting your posts'})
    }
}


export const updatePost = async(req, res)=>{
    try {
       //Getting data
       let data = req.body
       //Getting the id
       let {id} = req.params
       //Checking that the post exists.
       let post = await Publication.findOne({_id: id})
       if (!post) return res.status(404).send({message: 'Post not found'})
       //Validating that the user is the author of the post
        if (post.author.toString()!== req.user._id.toString()) return res.status(401).send({message: 'Unauthorized'})
       let update = checkUpdate(data, id)
       if (!update) return res.status(400).send({ message: 'Have submitted some data that cannot be update or missing' })
       
       //Updating the product
       let updatedPost = await Publication.updateOne(
            {_id: id},
            data,
            {new: true}
       ).populate('author', ['name', 'email'])
       //Validation of the updated action that we made
       if(!updatedPost) return res.status(404).send({message: 'Publication has not been updated.'})
       return res.status(200).send({message: 'The publication has been updated successfully'})
    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error updating the posts.' })
    }
}

export const deletePost = async(req, res)=>{
    try {
        //Getting the id of the publication
        let {id} = req.params
        //Id of the user
        let {_id} = req.user._id

        //Searching the publication to make our next validation.
        let post = await Publication.findOne({_id:id})
        //Validating that the user is the author of the post. If he is not, he cannot delete
        if(post.author._id.toString() !== _id.toString()) return res.status(200).send({message: 'Unauthorized. You cannot delete the publication of others.'})
        //Deleting the comments that are related to the publication
        let commentsDeleted = await Comment.find({publication: post._id})
        //Deleting the comments
        for(let comment of commentsDeleted){
            await Comment.findByIdAndDelete({_id: comment._id})
        }
        
        
        //Deleting the post
        let deletedPost = await Publication.findByIdAndDelete({_id: id})
        //Verifying the deleted post
        if(!deletedPost) return res.status(400).send({message: 'Post has not been deleted'})
        //Replying
        return res.status(200).send({message: 'The post has been deleted successfully'})

    } catch (err) {
        console.error(err)
        return res.status(500).send({ message: 'Error deleting the post.' })
    }
}