module.exports = () => {
  const time = new Date();
  return `${time.getDate()}-${time.getMonth() + 1}-${time.getUTCFullYear()}-${time.getHours()}-${time.getMinutes()}-${time.getSeconds()}`;
}
