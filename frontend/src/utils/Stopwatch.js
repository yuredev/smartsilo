export default class {
    constructor() {
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
    }
    formatTimeToShow(time) {
        time = String(time);
        if (time.length == 1) {
            time = '0' + time;
        }
        return time;
    }
    getTime() {
        this.time = `${this.hours > 0 ? this.formatTimeToShow(this.hours)+':' : ''}${this.formatTimeToShow(this.minutes)}:${this.formatTimeToShow(this.seconds)}`;        
        if (this.days > 0) {
            this.time = `${this.days} days, ${this.hours} hours and ${this.minutes} minutes`;
        }
        return this.time;
    }
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
    stop() {
        this.days = 0;
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.pause();
    }
    pause() {
        clearInterval(this.stopwatch);
    }
}