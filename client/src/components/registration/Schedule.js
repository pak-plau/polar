import React from 'react';
import '../../stylesheets/Schedule.css';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';

const locales = {
    'en-US': require('date-fns/locale/en-US'),
};
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales, });

const Schedule = ({ rows }) => {
    const strToTimes = (row) => {
        let arr = [];
        for (const char of row.days) {
            let days = ['U', 'M', 'T', 'W', 'R', 'F', 'S'];
            let day = days.indexOf(char) + 1;
            arr.push([new Date(2024, 11, day, row.timeStart.getHours(), row.timeStart.getMinutes()), new Date(2024, 11, day, row.timeEnd.getHours(), row.timeEnd.getMinutes())]);
        }
        return arr;
    };

    const events = rows.flatMap((row) => (
        strToTimes(row).map((days) => ({
            title: row.class + ' ' + row.code + '-' + row.section,
            start: days[0],
            end: days[1]
        }))
    ));

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
