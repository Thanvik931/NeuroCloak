import mongoose, { Document, Schema } from 'mongoose'

export type Domain = 'healthcare' | 'finance' | 'defense' | 'industrial'

export interface IAiSystem extends Document {
  name:        string
  domain:      Domain
  description: string
  isActive:    boolean
  accuracy:    number
  precision:   number
  recall:      number
  fairnessScore: number
  trainingDatasetSize: number
  createdAt:   Date
}

const AiSystemSchema = new Schema<IAiSystem>({
  name:        { type: String, required: true },
  domain:      { type: String, required: true, enum: ['healthcare', 'finance', 'defense', 'industrial', 'logistics', 'cybersecurity'] },
  description: { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  accuracy:    { type: Number, default: 0 },
  precision:   { type: Number, default: 0 },
  recall:      { type: Number, default: 0 },
  fairnessScore: { type: Number, default: 0 },
  trainingDatasetSize: { type: Number, default: 0 }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

export const AiSystem = mongoose.model<IAiSystem>('AiSystem', AiSystemSchema)
