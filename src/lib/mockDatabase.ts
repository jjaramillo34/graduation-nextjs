// Mock database for demo purposes when MongoDB is not available
import { Event, Registration, EventWithRegistrations } from '@/types';
import fs from 'fs';
import path from 'path';

// In-memory storage
let eventsData: Event[] = [];
let registrationsData: Registration[] = [];
let nextRegistrationId = 1;

// Load events from JSON file
export async function loadEventsFromFile(): Promise<Event[]> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'events.json');
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(fileContent);
      
      if (data.events && Array.isArray(data.events)) {
        eventsData = data.events;
        return eventsData;
      }
    }
    
    // Fallback sample data if file doesn't exist
    eventsData = [
      {
        id: 1,
        school_number: "1",
        principal: "Sarada Dorce",
        date: "June 18th",
        time: "5pm",
        location: "Lehman HS-3000 Tremont Ave.\nBronx, NY  10465",
        address: "",
        ceremony_type: "Graduation Ceremony",
        title: "School 1 Graduation Ceremony",
        year: "2025",
        raw_text: "",
        extracted_at: new Date().toISOString()
      },
      {
        id: 2,
        school_number: "2",
        principal: "Olga Steward Nelson",
        date: "June 20th",
        time: "6pm",
        location: "I.S. 61\n98-50th , Corona, NY11368",
        address: "",
        ceremony_type: "Graduation Ceremony",
        title: "School 2 Graduation Ceremony",
        year: "2025",
        raw_text: "",
        extracted_at: new Date().toISOString()
      },
      {
        id: 3,
        school_number: "3",
        principal: "Sabrina Fleming",
        date: "June 18th",
        time: "6pm",
        location: "142-10 Linden Blvd.",
        address: "",
        ceremony_type: "Graduation Ceremony",
        title: "School 3 Graduation Ceremony",
        year: "2025",
        raw_text: "",
        extracted_at: new Date().toISOString()
      }
    ];
    
    return eventsData;
  }
}

// Get all events with registration counts
export async function getAllEventsWithRegistrations(): Promise<EventWithRegistrations[]> {
  if (eventsData.length === 0) {
    await loadEventsFromFile();
  }

  return eventsData.map(event => {
    const registrationCount = registrationsData.filter(r => r.eventId === event.id).length;
    return {
      ...event,
      registrationCount,
      isFullyBooked: registrationCount >= 2,
    };
  });
}

// Get event by ID
export async function getEventById(id: number): Promise<Event | null> {
  if (eventsData.length === 0) {
    await loadEventsFromFile();
  }
  
  return eventsData.find(event => event.id === id) || null;
}

// Create registration
export async function createRegistration(data: {
  eventId: number;
  email: string;
  name: string;
}): Promise<Registration> {
  // Check if event exists
  const event = await getEventById(data.eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  // Check if already registered
  const existing = registrationsData.find(
    r => r.eventId === data.eventId && r.email.toLowerCase() === data.email.toLowerCase()
  );
  if (existing) {
    throw new Error('Already registered for this event');
  }

  // Check capacity
  const currentCount = registrationsData.filter(r => r.eventId === data.eventId).length;
  if (currentCount >= 2) {
    throw new Error('Event is at maximum capacity');
  }

  // Create registration
  const registration: Registration = {
    _id: nextRegistrationId.toString(),
    eventId: data.eventId,
    email: data.email.toLowerCase(),
    name: data.name.trim(),
    registeredAt: new Date(),
  };

  registrationsData.push(registration);
  nextRegistrationId++;

  return registration;
}

// Get all registrations
export async function getAllRegistrations(): Promise<Registration[]> {
  return registrationsData;
}

// Get registration statistics
export async function getRegistrationStatistics() {
  const totalRegistrations = registrationsData.length;
  const totalEvents = eventsData.length;
  const eventsWithRegistrations = new Set(registrationsData.map(r => r.eventId)).size;
  const eventsWithoutRegistrations = totalEvents - eventsWithRegistrations;

  // Registration counts by event
  const registrationsByEvent = eventsData.map(event => {
    const eventRegistrations = registrationsData.filter(r => r.eventId === event.id);
    return {
      _id: event.id,
      count: eventRegistrations.length,
      registrations: eventRegistrations,
    };
  }).filter(item => item.count > 0);

  return {
    totalRegistrations,
    totalEvents,
    eventsWithRegistrations,
    eventsWithoutRegistrations,
    averageRegistrationsPerEvent: totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(2) : '0',
    registrationsByEvent,
  };
}

// Clear all data (for testing)
export function clearAllData() {
  eventsData = [];
  registrationsData = [];
  nextRegistrationId = 1;
}
