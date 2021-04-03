const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const feedSchema = {
    content: String,
    created_at: Date,
    author: String
  };
  module.exports= mongoose.model("Feed", feedSchema);