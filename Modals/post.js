const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const postSchema =( {
    title:{
        type:String
    } ,
    content:{
        type:String
    },
    author:{
        type:String
    },
    
 
    created_at:{
        type:Date
    },

    imageurl: {
      type: String
    }
  });
 
  module.exports=mongoose.model("Post",postSchema);