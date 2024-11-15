const mongoose=require('mongoose');
const CarSchema= new mongoose.Schema({

  title:{type:String, required: true},
  description:{type:String},
  tags:[String],
  images:[String],
  user:{type:mongoose.Schema.Types.ObjectId,ref: 'User',required:true},
});
module.exports=mongoose.model('Car',CarSchema);