import React from 'react';
import type { ScheduleItem } from '../types/schedule';
import { format, parse } from 'date-fns';

interface ScheduleProps {
    schedule: ScheduleItem[];
}

export default function ScheduleTable({ schedule }: ScheduleProps) {
    if (!schedule || schedule.length === 0) {
        return <div>No schedule data available.</div>;
    }

    return (
        <table>
            <tbody>
                {schedule.map(item => (
                    <React.Fragment key={item.date}>
                        <tr className="bg-mist-700">
                            <td colSpan={3}>
                                {format(parse(item.date, 'yyyy-MM-dd', new Date()), 'EEEE, MMMM d, yyyy')}
                            </td>
                        </tr>
                        {item.games.map(game => (
                            <tr key={`${item.date}-${game.time}-${game.opponent}`}>
                                <td>{format(parse(`${item.date} ${game.time}`, 'yyyy-MM-dd h:mm a', new Date()), 'p')}</td>
                                <td>Court {game.court}</td>
                                <td>vs {game.opponent}</td>
                            </tr>
                        ))}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );
}
