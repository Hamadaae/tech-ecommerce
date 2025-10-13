import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name : { type : String , required : true , trim : true },
    email : { type : String , required : true , unique : true, lowercase : true , index : true },
    password : { type : String , required : true },
    role : { type : String , enum : ['admin', 'user'] , default : 'user' },
}, { timestamps : true });

userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
}

export default mongoose.models.User || mongoose.model('User', userSchema);