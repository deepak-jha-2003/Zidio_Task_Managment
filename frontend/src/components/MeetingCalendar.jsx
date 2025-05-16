import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './MeetingCalendar.css';

const locales = {
    
    'en-US': {} // Empty object is fine for English
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const MeetingCalendar = ({ meetings, onSelectMeeting }) => {
    const [currentView, setCurrentView] = useState('month');

    const events = meetings.map(meeting => ({
        id: meeting._id,
        title: meeting.title,
        start: new Date(meeting.startTime),
        end: new Date(meeting.endTime),
        allDay: false
    }));

    return (
        <div className="meeting-calendar">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                onSelectEvent={event => onSelectMeeting(event.id)}
                view={currentView}
                onView={setCurrentView}
            />
        </div>
    );
};

export default MeetingCalendar;