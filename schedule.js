// Wall-clock Pomodoro. Every hour: :00 work, :25 break, :30 work, :55 break.
// [startMinute, endMinute, phase]
export const SLOTS = [
  [0, 25, 'work'],
  [25, 30, 'break'],
  [30, 55, 'work'],
  [55, 60, 'break'],
];

export function phaseAt(date) {
  const minute = date.getMinutes();
  const [, end, phase] = SLOTS.find(([start, stop]) => minute >= start && minute < stop);
  const endsAt = new Date(date);
  endsAt.setMinutes(end, 0, 0);
  return { phase, endsAt, remainingMs: endsAt - date };
}
