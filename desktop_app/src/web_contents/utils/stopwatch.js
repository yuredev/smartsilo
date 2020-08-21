class Stopwatch {
  /**
   * Class to create objects that represents a stopwatch to count time and display it
   */
  constructor() {
    this.days = 0;
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
  }
  /**
   * function to get the current time of the stopwatch
   * @returns {String} a string that displays the current time
   */
  getTime() {
    this.time = `${
      this.hours > 0 ? formatTime(this.hours) + ':' : ''
    }${formatTime(this.minutes)}:${formatTime(this.seconds)}`;
    if (this.days > 0) {
      this.time = `${this.days} days, ${this.hours} hours and ${this.minutes} minutes`;
    }
    return this.time;
  }
  /**
   * Make the stopwatch starts to count
   */
  start() {
    this.stopwatch = setInterval(() => {
      if (++this.seconds == 60) {
        this.seconds = 0;
        this.minutes++;
      }
      if (this.minutes == 60) {
        this.minutes = 0;
        this.hours++;
      }
      if (this.hours == 24) {
        this.hours = 0;
        this.days++;
      }
    }, 1000);
  }
  /**
   * stop and reset to 0 the time of the stopwatch
   */
  stop() {
    this.days = 0;
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.pause();
  }
  /**
   * pauses the stopwatch counting
   */
  pause() {
    clearInterval(this.stopwatch);
  }
}

/**
 * complements a number less than 10 with a zero left
 * @param {String || Number} time the number that maybe have to complemented with a zero left
 * @returns {String} returns the formated time string
 */
function formatTime(time) {
  time = String(time);
  if (time.length == 1) {
    time = '0' + time;
  }
  return time;
}

export default Stopwatch;