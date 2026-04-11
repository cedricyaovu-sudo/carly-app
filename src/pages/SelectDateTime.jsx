import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../contexts/BookingContext';

const SelectDateTime = () => {
    const navigate = useNavigate();
    const { updateBooking } = useBooking();

    const minBookableDate = new Date(2026, 3, 26);
    minBookableDate.setHours(0, 0, 0, 0);

    // State for Calendar
    const [currentMonth, setCurrentMonth] = useState(() => new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [timeSlots, setTimeSlots] = useState([]);

    useEffect(() => {
        // Generate time slots: 45 min intervals for 24 hours
        const slots = [];
        let start = 0; // 0 minutes (12:00 AM)
        const end = 24 * 60; // 1440 minutes (12:00 AM next day)

        const formatTime = (minutes) => {
            const h = Math.floor(minutes / 60) % 24;
            const m = minutes % 60;
            const ampm = h >= 12 ? 'PM' : 'AM';
            const hour = h % 12 || 12;
            const minute = m.toString().padStart(2, '0');
            return `${hour}:${minute} ${ampm}`;
        };

        while (start < end) {
            const startTime = formatTime(start);
            const endTime = formatTime(start + 90);
            slots.push(`${startTime} - ${endTime}`);
            start += 90;
        }
        setTimeSlots(slots);
    }, []);

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        return { days, firstDay, year, month };
    };

    const handlePrevMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() - 1);
        const now = new Date();
        if (newDate.getMonth() < now.getMonth() && newDate.getFullYear() === now.getFullYear()) return;
        if (newDate.getFullYear() < now.getFullYear()) return;
        setCurrentMonth(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + 1);
        setCurrentMonth(newDate);
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(newDate);
    };

    const handleContinue = () => {
        if (!selectedDate || !selectedTime) return;

        const dateStr = selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Parse the selected time to create a proper Date object
        const timeParts = selectedTime.split(' - ')[0]; // Get start time e.g., "10:00 AM"
        const [time, period] = timeParts.split(' ');
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;

        const scheduledDate = new Date(selectedDate);
        scheduledDate.setHours(hour, parseInt(minutes), 0, 0);

        updateBooking({
            dateTime: `${dateStr} at ${selectedTime}`,
            scheduledTime: scheduledDate.toISOString() // ISO format for database
        });
        navigate('/checkout');
    };

    const { days, firstDay, year, month } = getDaysInMonth(currentMonth);
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Progress Indicator */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <div style={{ color: '#999', fontSize: '14px', marginBottom: '8px' }}>Step 3 of 4</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4].map(step => (
                        <div
                            key={step}
                            style={{
                                flex: 1,
                                height: '4px',
                                background: step <= 3 ? 'var(--color-primary)' : '#E5E5EA',
                                borderRadius: '2px'
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Calendar Interface */}
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-md)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--spacing-xl)' }}>
                {/* Month Selector */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
                    <button
                        type="button"
                        onClick={handlePrevMonth}
                        style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer', opacity: (currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()) ? 0.3 : 1 }}
                        disabled={currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{monthNames[month]} {year}</h3>
                    <button type="button" onClick={handleNextMonth} style={{ background: 'none', border: 'none', padding: '8px', cursor: 'pointer' }}><ChevronRight size={24} /></button>
                </div>

                {/* Days Header */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px', fontSize: '14px', color: '#999', fontWeight: '500' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>

                {/* Days Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: '24px', columnGap: '4px' }}>
                    {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: days }).map((_, i) => {
                        const day = i + 1;
                        const date = new Date(year, month, day);
                        const isToday = date.getTime() === today.getTime();
                        const isDisabled = date < today || date < minBookableDate;
                        const isSelected = selectedDate && date.getTime() === selectedDate.getTime();

                        return (
                            <div key={day} style={{ display: 'flex', justifyContent: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => !isDisabled && handleDateClick(day)}
                                    disabled={isDisabled}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        minWidth: '40px',
                                        minHeight: '40px',
                                        borderRadius: '50%',
                                        background: isSelected ? 'var(--color-primary)' : 'transparent',
                                        color: isSelected ? 'white' : (isDisabled ? '#ccc' : 'black'),
                                        fontWeight: isSelected || isToday ? '600' : '400',
                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        border: isToday && !isSelected ? '1px solid var(--color-primary)' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: 0,
                                        flexShrink: 0
                                    }}
                                >
                                    {day}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Time Slots */}
            {selectedDate ? (
                <>
                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: 'black' }}>
                            Available Times on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                            All times are in your local timezone (CST)
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-sm)', maxHeight: '300px', overflowY: 'auto' }}>
                        {timeSlots.map((time) => (
                            <button
                                type="button"
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                style={{
                                    padding: '12px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid',
                                    borderColor: selectedTime === time ? 'var(--color-primary)' : 'var(--color-border)',
                                    background: selectedTime === time ? '#E0F2FE' : 'white',
                                    color: selectedTime === time ? 'var(--color-primary)' : 'black',
                                    fontWeight: '400',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-xl) 0', color: '#666' }}>
                    Please select a date to show available times.
                </div>
            )}

            {/* Footer Button */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', background: 'var(--color-background)', borderTop: '1px solid var(--color-border)', zIndex: 10 }}>
                <div style={{ width: '100%', maxWidth: '565px', padding: 'var(--spacing-md)' }}>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleContinue}
                        disabled={!selectedDate || !selectedTime}
                        style={{ width: '100%', opacity: (!selectedDate || !selectedTime) ? 0.5 : 1 }}
                    >
                        Continue to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectDateTime;
