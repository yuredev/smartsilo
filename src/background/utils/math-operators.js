module.exports = {
  // converte valor ADC em Celsius
  toCelsius(rawADC) {
    let temp = Math.log(10240000 / rawADC - 10000);
    temp = 1 / (0.001129148 + 0.000234125 * temp + 0.0000000876741 * temp ** 3);
    temp = temp - 273.15; // Kelvin para Celsius
    return temp;
  },
  // retorna correspondente do valor em outra escala
  scaleOutput(value, inverse = false) {
    let from;
    let to;
    if (!inverse) {
      (from = [0, 5]), (to = [0, 255]);
    } else {
      (from = [0, 255]), (to = [0, 5]);
    }
    let scale = (to[1] - to[0]) / (from[1] - from[0]);
    let capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
    return capped * scale + to[0];
  },
};
