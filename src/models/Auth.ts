import mongoose, { Schema } from 'mongoose';

const authSechema = new Schema({    
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    }, {
    timestamps: true,
    });
export const Auth =
  mongoose.models.Auth || mongoose.model('Auth', authSechema);