export default (date: Date, time: { h: number; m: number; s: number }) => {
  const timeMillis = time.h * 3600 * 1000 + time.m * 60 * 1000 + time.s * 1000;

  return new Date(date.getTime() + timeMillis);
};
