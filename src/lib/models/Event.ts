import mongoose, { Schema, Document } from 'mongoose';
// import { Event } from '../../types'; // Not used, so removed

export interface IEvent extends Document {
  id: number;
  school_number: string;
  principal: string;
  date: string;
  time: string;
  location: string;
  address: string;
  ceremony_type: string;
  title: string;
  year: string;
  raw_text: string;
  extracted_at: string;
}

const EventSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  school_number: { type: String, required: true },
  principal: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  address: { type: String, default: '' },
  ceremony_type: { type: String, required: true },
  title: { type: String, required: true },
  year: { type: String, required: true },
  raw_text: { type: String, default: '' },
  extracted_at: { type: String, required: true },
}, {
  timestamps: true,
});

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
