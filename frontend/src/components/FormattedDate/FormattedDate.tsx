type FormattedDateProps = {
  children: string | number | Date;
  format?: string;
  locale?: string;
};

export function FormattedDate({ children, format = "LL", locale = "en-US" }: FormattedDateProps) {
  // Convert the child prop (the date string/timestamp) into a Date object
  const date = new Date(children);

  // Return early if the date is invalid to prevent rendering crashes
  if (isNaN(date.getTime())) {
    return <span>Invalid Date</span>;
  }

  // Map Moment.js string tokens to native Intl.DateTimeFormat options
  let options = {};

  switch (format) {
    case "LL": // e.g., "September 4, 1986"
      options = { year: "numeric", month: "long", day: "numeric" };
      break;
    case "L": // e.g., "09/04/1986"
      options = { year: "numeric", month: "2-digit", day: "2-digit" };
      break;
    case "LT": // e.g., "8:30 PM"
      options = { hour: "numeric", minute: "2-digit" };
      break;
    case "LLL": // e.g., "September 4, 1986 at 8:30 PM"
      options = { 
        year: "numeric", 
        month: "long", 
        day: "numeric", 
        hour: "numeric", 
        minute: "2-digit" 
      };
      break;
    // Add more cases here as your app needs them
    default:
      options = { year: "numeric", month: "long", day: "numeric" };
  }

  // Generate the formatted string
  const formattedString = new Intl.DateTimeFormat(locale, options).format(date);

  // Wrap in a <time> tag for semantic HTML and accessibility
  return (
    <time dateTime={date.toISOString()}>
      {formattedString}
    </time>
  );
}