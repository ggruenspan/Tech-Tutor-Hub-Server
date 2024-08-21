// middleware/getLocalTime.js

// Function to get the system's time zone
const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Function to get the local time
const getLocalTime = () => {
  return new Date(new Date().toLocaleString('en-US', { timeZone: systemTimeZone }));
};

// Middleware function to add local time to every response
const localTimeMiddleware = (req, res, next) => {
  const localTime = getLocalTime();

  // Adding the local time to the response
  res.locals.localTime = localTime;

  // Proceed to the next middleware/route handler
  next();
};

module.exports = localTimeMiddleware;