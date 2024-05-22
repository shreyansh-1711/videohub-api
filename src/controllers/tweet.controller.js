import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const {content } = req.body
    if(!content ){
        throw new ApiError(400,"Tweet content not provided")
    }
    const tweet =  await Tweet.create({
        content : req.body.content,
        owner : req.user
    } )
    
    if(!tweet){
        throw new ApiError(500,"Some error occured while creating a tweet")
    } 

    res
    .status(200)
    .json(
        new ApiResponse(
            201 , 
            tweet ,
            "Tweet created successfully"
        ) 
    )


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const {userId} =  req.params;
    const { page = 1, limit = 10, sortType } = req.query

    const parsedLimit = parseInt(limit);
    const pageSkip = (page - 1) * parsedLimit;
    const sortBy = sortType === 'new' ? 1 : -1;

    if(!userId ){
        throw new ApiError(400,"Invalid USer ID")
    }

    const user = await User.findById(userId);
    if (!user) {
        return new ApiError(404, "User not found");
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: {
                createdAt: sortBy
            }
        },
        {
            $skip: pageSkip
        },
        {
            $limit: parsedLimit
        },
        {
            $lookup: {
                from: 'likes',
                let: { tweetId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ['$tweet', '$$tweetId'] }
                        }
                    }
                ],
                as: 'likes'
            }
        },
        {
            $addFields: {
                likeCount: { $size: '$likes' }
            }
        },
        {
            $project: {
                likes: 0
            }
        }
    ]);

    if (!tweets) {
        return new ApiError(500, "Some error occurred while fetching tweets");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweets,
                "User Tweets fetched successfully"
            )
        );

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

        const {updateTweetContent} = req.body;
        const {tweetId} =  req.params;
        if(!(updateTweetContent || tweetId) ){
            throw new ApiError(400,"Invalid/Something messied")
        }

        const tweet = await Tweet.findByIdAndUpdate(
            tweetId, 
            {
                $set:{
                    content : updateTweetContent
                }
            }, 
            {new : true}
        )


        if (!tweet) {
            return new ApiError(404, "Some error occurred while updating tweet");
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweet,
                "Tweet updated successfully"
            )
        );


})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} =  req.params;
    if(!(tweetId) ){
        throw new ApiError(400,"Invalid/Something messied")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId);

    if (!tweet) {
        return new ApiError(404, "Some error occurred while deleting tweet");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            tweet,
            "Deleted tweet successfully"
        )
    );


})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}