'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { EventWithRegistrations, RegistrationFormData } from '@/types';
import { registrationSchema } from '@/lib/validations';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RegistrationFormProps {
  events: EventWithRegistrations[];
  selectedEventId?: number;
  onSuccess: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  eventId?: string;
  submit?: string;
}

export default function RegistrationForm({ 
  events, 
  selectedEventId, 
  onSuccess 
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors },
    setValue,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      eventId: selectedEventId || 0,
      name: '',
      email: '',
    },
  });

  React.useEffect(() => {
    if (selectedEventId) {
      setValue('eventId', selectedEventId);
    }
  }, [selectedEventId, setValue]);

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      // Check if user is already registered for this event
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors(result.errors || { submit: result.message });
        return;
      }

      setSuccessMessage('Registration successful! Your registration has been saved.');
      const registeredEvent = events.find(event => event.id === data.eventId);
      toast.success('Registration successful!', {
        description: registeredEvent
          ? `You are registered for: ${registeredEvent.title} (${registeredEvent.date} at ${registeredEvent.time})`
          : 'You are registered for the selected event.'
      });
      reset();
      onSuccess();
      
    } catch (error) {
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // P2G event ids
  const unlimitedEventIds = [14, 15];
  // Available events: unlimited for P2G, <2 for others
  const availableEvents = events.filter(event => unlimitedEventIds.includes(event.id) || event.registrationCount < 2);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <CardTitle>Event Registration</CardTitle>
          </div>
          <img 
            src="/d79-logo.png" 
            alt="District 79 Logo" 
            className="h-8 w-auto"
          />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              {...register('name')}
              className={formErrors.name ? 'border-red-500' : ''}
            />
            {formErrors.name && (
              <p className="text-sm text-red-500">{formErrors.name.message}</p>
            )}
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@schools.nyc.gov"
              {...register('email')}
              className={formErrors.email ? 'border-red-500' : ''}
            />
            {formErrors.email && (
              <p className="text-sm text-red-500">{formErrors.email.message}</p>
            )}
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
            <p className="text-xs text-gray-500">
              Only @schools.nyc.gov email addresses are allowed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventId">Select Event</Label>
            <Select
              id="eventId"
              {...register('eventId', { valueAsNumber: true })}
              className={formErrors.eventId ? 'border-red-500' : ''}
            >
              <option value={0}>Choose an event...</option>
              {availableEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  School {event.school_number} - {event.date} at {event.time}
                  {unlimitedEventIds.includes(event.id)
                    ? ' (Unlimited spots)'
                    : event.registrationCount > 0
                      ? ` (${2 - event.registrationCount} spots left)`
                      : ''}
                </option>
              ))}
            </Select>
            {formErrors.eventId && (
              <p className="text-sm text-red-500">{formErrors.eventId.message}</p>
            )}
            {errors.eventId && (
              <p className="text-sm text-red-500">{errors.eventId}</p>
            )}
          </div>

          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{successMessage}</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || availableEvents.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </Button>
          
          {availableEvents.length === 0 && (
            <p className="text-sm text-orange-600 text-center">
              All events are currently full. Please check back later.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
