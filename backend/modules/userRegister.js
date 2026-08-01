import mongoose from "mongoose";
const userRegisterSchema = new mongoose.Schema({
     userName: {
        type: String,
        required: true,
        trim: true 
     },
     phone: {
         type: String, 
         required: true,
     },
     email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
     },
     password: {
        type: String,
        required: true,
        select: false,
     },
     role: {
        type: String,
        enum: ['USER', 'ADMIN', 'DEALER',], 
        default: "USER" , 
     },
    
     isSuspended: {
        type: Boolean,
        default: false
     },
     cart: [
        {
           productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
           quantity: { type: Number, default: 1 }
        }
     ]
}, { 
    timestamps: true 
});

export const Register = mongoose.model("Users", userRegisterSchema);
