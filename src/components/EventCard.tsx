'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EventWithRegistrations } from '@/types';
import { formatLocation } from '@/lib/utils';
import { Calendar, Clock, MapPin, User, GraduationCap } from 'lucide-react';

interface EventCardProps {
  event: EventWithRegistrations;
  onRegister: (eventId: number) => void;
}

export default function EventCard({ event, onRegister }: EventCardProps) {
  const isUnlimited = event.id === 14 || event.id === 15;
  const isFullyBooked = !isUnlimited && event.registrationCount >= 2;

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
      <CardHeader className="pb-4 relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold text-gray-900">
              School {event.school_number}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isFullyBooked ? "destructive" : "success"}
              className="ml-2"
            >
              {isUnlimited
                ? "Unlimited spots"
                : isFullyBooked
                  ? "Full"
                  : `${2 - event.registrationCount} spots left`}
            </Badge>
            <img 
              src="/d79-logo.png" 
              alt="D79" 
              className="h-6 w-auto opacity-30"
              title="District 79"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>Principal: {event.principal}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{event.date}, {event.year}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="break-words">{formatLocation(event.location)}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={() => onRegister(event.id)}
            disabled={isFullyBooked}
            className="w-full"
            variant={isFullyBooked ? "secondary" : "default"}
          >
            {isFullyBooked ? "Event Full" : "Register Now"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
