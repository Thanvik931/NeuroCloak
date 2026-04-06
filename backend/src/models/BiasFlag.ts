import mongoose, { Document, Schema } from 'mongoose'

export type BiasSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface IBiasFlag extends Document {
  decisionId:     mongoose.Types.ObjectId
  biasType:       string
  severity:       BiasSeverity
  description:    string
  corrected:      boolean
  correctionNote: string | null
  detectedAt:     Date
}

const BiasFlagSchema = new Schema<IBiasFlag>({
  decisionId:     { type: Schema.Types.ObjectId, ref: 'Decision', required: true },
  biasType:       { type: String, required: true },
  severity:       { type: String, required: true, enum: ['low', 'medium', 'high', 'critical'] },
  description:    { type: String, required: true },
  corrected:      { type: Boolean, default: false },
  correctionNote: { type: String, default: null },
  detectedAt:     { type: Date, default: Date.now }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

BiasFlagSchema.index({ decisionId: 1 })

export const BiasFlag = mongoose.model<IBiasFlag>('BiasFlag', BiasFlagSchema)
