import mongoose, { Document, Schema } from 'mongoose'

export type UserRole = 'ADMIN' | 'AUDITOR' | 'VIEWER'

export interface IUser extends Document {
  email:        string
  passwordHash: string
  role:         UserRole
  createdAt:    Date
}

const UserSchema = new Schema<IUser>({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, required: true, enum: ['ADMIN', 'AUDITOR', 'VIEWER'], default: 'VIEWER' }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

export const User = mongoose.model<IUser>('User', UserSchema)
