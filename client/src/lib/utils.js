import {
  isToday,
  format,
  isYesterday,
  isWithinInterval,
  subDays,
  isThisYear,
} from 'date-fns';

export default function formatDateTime(time) {
  if (isToday(time)) return 'Today, ' + format(time, 'HH:mm');
  else if (isYesterday(time)) return 'Yesterday';
  else if (
    isWithinInterval(time, { start: subDays(new Date(), 7), end: new Date() })
  )
    return format(time, 'EEEE');
  else if (isThisYear(time)) return format(time, 'dd.MM.');
  else return format(time, 'dd.MM.yyyy.');
}
