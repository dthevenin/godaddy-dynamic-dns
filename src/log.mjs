const options = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hour12: false,
};

const dataFormatter = new Intl.DateTimeFormat('en-US', options);

const now = () => `[${dataFormatter.format(Date.now())}]`;

const log = (...parameters) => console.log(now(), ...parameters);

export default log;
