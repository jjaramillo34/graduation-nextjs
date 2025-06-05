export interface Event {
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

export interface EventsData {
  extraction_metadata: {
    source_file: string;
    extracted_at: string;
    total_events_found: number;
    parser_version: string;
  };
  events: Event[];
}

export interface Registration {
  _id?: string;
  eventId: number;
  email: string;
  name: string;
  registeredAt: Date;
}

export interface RegistrationFormData {
  eventId: number;
  email: string;
  name: string;
}

export interface EventWithRegistrations extends Event {
  registrationCount: number;
  isFullyBooked: boolean;
}
