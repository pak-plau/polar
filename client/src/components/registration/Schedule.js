import React from 'react';
import '../../stylesheets/Schedule.css';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';

const Schedule = () => {
    const locales = {
        'en-US': require('date-fns/locale/en-US'),
    };
    const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales, });
    const events = [
        {
        title: 'CSE 316 - 01',
        start: new Date(2024, 11, 2, 11, 0),
        end: new Date(2024, 11, 2, 12, 20),
        },
        {
        title: 'CSE 385 - 01',
        start: new Date(2024, 11, 3, 14, 30),
        end: new Date(2024, 11, 3, 15, 50),
        },
    ];
    return (
        <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={['week']}
        defaultDate={new Date(2024, 11, 1)}
        components={{
            toolbar: () => null,
        }}
        formats={{
            dayFormat: (date, culture, localizer) => localizer.format(date, 'EEEE'),
        }}
        min={new Date(2024, 11, 1, 8, 0)}
        max={new Date(2024, 11, 1, 22, 0)}
        />
    );
};

export default Schedule;
