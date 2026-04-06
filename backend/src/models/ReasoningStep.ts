import mongoose, { Document, Schema } from 'mongoose'

export interface IReasoningStep extends Document {
  decisionId:      mongoose.Types.ObjectId
  stepNumber:      number
  layer:           string
  description:     string
  inputValue:      string
  outputValue:     string
  confidence:      number
  isInterpretable: boolean
  durationMs:      number
  createdAt:       Date
}

const ReasoningStepSchema = new Schema<IReasoningStep>({
  decisionId:      { type: Schema.Types.ObjectId, ref: 'Decision', required: true },
  stepNumber:      { type: Number, required: true },
  layer:           { type: String, required: true },
  description:     { type: String, required: true },
  inputValue:      { type: String, default: '' },
  outputValue:     { type: String, default: '' },
  confidence:      { type: Number, required: true },
  isInterpretable: { type: Boolean, default: true },
  durationMs:      { type: Number, required: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

ReasoningStepSchema.index({ decisionId: 1, stepNumber: 1 })
ReasoningStepSchema.index({ createdAt: -1 })

export const ReasoningStep = mongoose.model<IReasoningStep>('ReasoningStep', ReasoningStepSchema)
