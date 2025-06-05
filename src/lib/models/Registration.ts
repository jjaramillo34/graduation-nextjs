import mongoose, { Schema, Document } from 'mongoose';
import { Registration } from '@/types';

export interface IRegistration extends Document {
  eventId: number;
  email: string;
  name: string;
  registeredAt: Date;
}

const RegistrationSchema: Schema = new Schema({
  eventId: { 
    type: Number, 
    required: true,
    ref: 'Event'
  },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    validate: {
      validator: function(email: string) {
        return email.endsWith('@schools.nyc.gov');
      },
      message: 'Email must be from @schools.nyc.gov domain'
    }
  },
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  registeredAt: { 
    type: Date, 
    default: Date.now 
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate registrations
RegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true });

export default mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema);
