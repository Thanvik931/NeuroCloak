import mongoose, { Document, Schema } from 'mongoose'

export type DecisionStatus = 'PENDING' | 'APPROVED' | 'FLAGGED' | 'BLOCKED'

export interface IDecision extends Document {
  aiSystemId:            mongoose.Types.ObjectId
  userId?:               mongoose.Types.ObjectId
  inputData:             Record<string, unknown>
  outputDecision:        string
  confidenceScore:       number
  cognitiveConsistency:  number
  transparencyIndex:     number
  ethicalComplianceRate: number
  adaptationSpeed:       number
  selfRepairEfficiency:  number | null
  status:                DecisionStatus
  createdAt:             Date
}

const DecisionSchema = new Schema<IDecision>({
  aiSystemId:            { type: Schema.Types.ObjectId, ref: 'AiSystem', required: true },
  userId:                { type: String, ref: 'User' },
  inputData:             { type: Schema.Types.Mixed, default: {} },
  outputDecision:        { type: String, required: true },
  confidenceScore:       { type: Number, required: true },
  cognitiveConsistency:  { type: Number, required: true },
  transparencyIndex:     { type: Number, required: true },
  ethicalComplianceRate: { type: Number, required: true },
  adaptationSpeed:       { type: Number, required: true },
  selfRepairEfficiency:  { type: Number, default: null },
  status:                { type: String, required: true, enum: ['PENDING', 'APPROVED', 'FLAGGED', 'BLOCKED'], default: 'PENDING' }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

DecisionSchema.index({ aiSystemId: 1, createdAt: -1 })
DecisionSchema.index({ userId: 1 })
DecisionSchema.index({ createdAt: -1 })
DecisionSchema.index({ status: 1 })

export const Decision = mongoose.model<IDecision>('Decision', DecisionSchema)
