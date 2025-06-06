import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/lib/models/Event';
import Registration from '@/lib/models/Registration';
import { createRegistration, getEventById } from '@/lib/mockDatabase';
import { registrationSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input data
    const validationResult = registrationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid input data',
          errors: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { eventId, email, name } = validationResult.data;

    // Try MongoDB first
    try {
      await dbConnect();

      // Check if event exists
      const event = await Event.findOne({ id: eventId });
      if (!event) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Event not found',
            errors: { eventId: 'Selected event does not exist' }
          },
          { status: 404 }
        );
      }

      // Check if user is already registered for this event
      const existingRegistration = await Registration.findOne({
        eventId,
        email: email.toLowerCase(),
      });

      if (existingRegistration) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Already registered',
            errors: { email: 'You are already registered for this event' }
          },
          { status: 409 }
        );
      }

      // Check if event is full (max 2 registrations), except for P2G events (id 14, 15)
      const unlimitedEventIds = [14, 15];
      if (!unlimitedEventIds.includes(eventId)) {
        const registrationCount = await Registration.countDocuments({ eventId });
        if (registrationCount >= 2) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Event is full',
              errors: { eventId: 'This event has reached maximum capacity (2 registrations)' }
            },
            { status: 409 }
          );
        }
      }

      // Create new registration
      const registration = new Registration({
        eventId,
        email: email.toLowerCase(),
        name: name.trim(),
        registeredAt: new Date(),
      });

      await registration.save();

      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        source: 'mongodb',
        registration: {
          id: registration._id,
          eventId: registration.eventId,
          email: registration.email,
          name: registration.name,
          registeredAt: registration.registeredAt,
        },
      });

    } catch (mongoError) {
      throw mongoError;
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to register',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}
