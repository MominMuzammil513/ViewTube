import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type: mongoose.Schema.Types.ObjectId, // one who to subscribing
        ref:"User",
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,// one who to subscriber is subscribing
        ref:"User",
    }
})

export const Subscription = mongoose.model('Subscription', subscriptionSchema);