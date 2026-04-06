import mongoose, { Document, Schema } from 'mongoose'

export interface IEthicsCheck extends Document {
  decisionId: mongoose.Types.ObjectId
  ruleId:     mongoose.Types.ObjectId
  passed:     boolean
  reason:     string
  checkedAt:  Date
}

const EthicsCheckSchema = new Schema<IEthicsCheck>({
  decisionId: { type: Schema.Types.ObjectId, ref: 'Decision', required: true },
  ruleId:     { type: Schema.Types.ObjectId, ref: 'GovernanceRule', required: true },
  passed:     { type: Boolean, required: true },
  reason:     { type: String, required: true },
  checkedAt:  { type: Date, default: Date.now }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

EthicsCheckSchema.index({ decisionId: 1 })

export const EthicsCheck = mongoose.model<IEthicsCheck>('EthicsCheck', EthicsCheckSchema)
