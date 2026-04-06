import mongoose, { Document, Schema } from 'mongoose'

export type Domain = 'healthcare' | 'finance' | 'defense' | 'industrial'

export interface IAiSystem extends Document {
  name:        string
  domain:      Domain
  description: string
  isActive:    boolean
  createdAt:   Date
}

const AiSystemSchema = new Schema<IAiSystem>({
  name:        { type: String, required: true },
  domain:      { type: String, required: true, enum: ['healthcare', 'finance', 'defense', 'industrial'] },
  description: { type: String, default: '' },
  isActive:    { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

export const AiSystem = mongoose.model<IAiSystem>('AiSystem', AiSystemSchema)
