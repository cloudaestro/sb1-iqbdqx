import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns'
import { Calendar, Clock, User, Plus } from 'lucide-react'

interface Event {
  id: string
  title: string
  start: string
  end: string
  attendees: string[]
}

interface TimeSlot {
  start: string
  end: string
}

const Schedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingDetails, setBookingDetails] = useState({ title: '', attendee: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
    fetchAvailableSlots()
  }, [currentDate])

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events', {
        params: {
          start: format(startOfWeek(currentDate), 'yyyy-MM-dd'),
          end: format(addDays(startOfWeek(currentDate), 6), 'yyyy-MM-dd'),
        },
      })
      setEvents(Array.isArray(response.data) ? response.data : [])
      setError(null)
    } catch (error) {
      console.error('Error fetching events:', error)
      setError('Failed to fetch events. Please try again later.')
      setEvents([])
    }
  }

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get('/api/available-slots', {
        params: {
          date: format(currentDate, 'yyyy-MM-dd'),
        },
      })
      setAvailableSlots(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error('Error fetching available slots:', error)
      setError('Failed to fetch available time slots.')
      setAvailableSlots([])
    }
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setShowBookingModal(true)
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSlot) return

    try {
      await axios.post('/api/events', {
        ...bookingDetails,
        start: selectedSlot.start,
        end: selectedSlot.end,
      })
      setShowBookingModal(false)
      setBookingDetails({ title: '', attendee: '' })
      fetchEvents()
      fetchAvailableSlots()
    } catch (error) {
      console.error('Error booking slot:', error)
      setError('Failed to book the slot. Please try again.')
    }
  }

  const renderWeekDays = () => {
    const weekStart = startOfWeek(currentDate)
    const days = []

    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i)
      days.push(
        <div key={i} className="border p-2">
          <h3 className="text-lg font-semibold">{format(day, 'EEEE')}</h3>
          <p className="text-sm text-gray-500">{format(day, 'MMM d')}</p>
          {renderEventsForDay(day)}
        </div>
      )
    }

    return days
  }

  const renderEventsForDay = (day: Date) => {
    if (!Array.isArray(events)) {
      console.error('Events is not an array:', events)
      return null
    }

    const dayEvents = events.filter((event) =>
      isSameDay(parseISO(event.start), day)
    )

    return dayEvents.map((event) => (
      <div key={event.id} className="bg-blue-100 p-2 my-1 rounded">
        <p className="font-semibold">{event.title}</p>
        <p className="text-sm">
          {format(parseISO(event.start), 'h:mm a')} - {format(parseISO(event.end), 'h:mm a')}
        </p>
        <p className="text-sm text-gray-600">{event.attendees.join(', ')}</p>
      </div>
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Schedule</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentDate(addDays(currentDate, -7))}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Previous Week
        </button>
        <h2 className="text-xl font-semibold">
          {format(startOfWeek(currentDate), 'MMMM d')} - {format(addDays(startOfWeek(currentDate), 6), 'MMMM d, yyyy')}
        </h2>
        <button
          onClick={() => setCurrentDate(addDays(currentDate, 7))}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Next Week
        </button>
      </div>
      <div className="grid grid-cols-7 gap-4 mb-8">{renderWeekDays()}</div>
      
      <h2 className="text-2xl font-bold mb-4">Available Time Slots</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {availableSlots.map((slot, index) => (
          <button
            key={index}
            onClick={() => handleSlotSelect(slot)}
            className="bg-green-100 p-4 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Clock className="inline-block mr-2" size={18} />
            {format(parseISO(slot.start), 'h:mm a')} - {format(parseISO(slot.end), 'h:mm a')}
          </button>
        ))}
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Book Session</h2>
            <form onSubmit={handleBookingSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Session Title</label>
                <input
                  type="text"
                  id="title"
                  value={bookingDetails.title}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="attendee" className="block text-sm font-medium text-gray-700">Student Name</label>
                <input
                  type="text"
                  id="attendee"
                  value={bookingDetails.attendee}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, attendee: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  Book Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Schedule