import mongoose, { Document, Schema } from 'mongoose'

export interface IAnomalyAlert extends Document {
  aiSystemId: mongoose.Types.ObjectId
  decisionId: mongoose.Types.ObjectId
  type:       string
  message:    string
  severity:   'warning' | 'critical'
  resolved:   boolean
  createdAt:  Date
}

const AnomalyAlertSchema = new Schema<IAnomalyAlert>({
  aiSystemId: { type: Schema.Types.ObjectId, ref: 'AiSystem', required: true },
  decisionId: { type: Schema.Types.ObjectId, ref: 'Decision', required: true },
  type:       { type: String, required: true },
  message:    { type: String, required: true },
  severity:   { type: String, required: true, enum: ['warning', 'critical'] },
  resolved:   { type: Boolean, default: false }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

AnomalyAlertSchema.index({ aiSystemId: 1 })
AnomalyAlertSchema.index({ resolved: 1 })

export const AnomalyAlert = mongoose.model<IAnomalyAlert>('AnomalyAlert', AnomalyAlertSchema)
