import mongoose, { Document, Schema } from 'mongoose'

export type RuleCategory = 'ethics' | 'legal' | 'safety' | 'fairness'

export interface IGovernanceRule extends Document {
  aiSystemId:  mongoose.Types.ObjectId
  name:        string
  description: string
  category:    RuleCategory
  isActive:    boolean
}

const GovernanceRuleSchema = new Schema<IGovernanceRule>({
  aiSystemId:  { type: Schema.Types.ObjectId, ref: 'AiSystem', required: true },
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  category:    { type: String, required: true, enum: ['ethics', 'legal', 'safety', 'fairness'] },
  isActive:    { type: Boolean, default: true }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })

GovernanceRuleSchema.index({ aiSystemId: 1 })

export const GovernanceRule = mongoose.model<IGovernanceRule>('GovernanceRule', GovernanceRuleSchema)
