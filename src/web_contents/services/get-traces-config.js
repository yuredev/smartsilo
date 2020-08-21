/**
 * function to get traces configuration of a chart
 * @param {type} type the chart type to determinate the traces config
 * @returns {Array} returns the traces config of the chart
 */
function getTracesConfig(type) {
  if (!type) {
    throw new Error('missing argument in type');
  }
  switch (type) {
    case 'Control':
      return [
        {
          y: [],
          type: 'line',
          name: type,
          line: {
            color: '#FAF',
            width: 3
          }
        }
      ];
    case 'Temperature':
      return [
        {
          y: [],
          type: 'line',
          name: 'Temperature',
          line: {
            color: '#306bae',
            width: 3
          }
        },
        {
          y: [],
          type: 'line',
          name: 'Setpoint',
          line: {
            color: '#66EE88',
            width: 3
          }
        }
      ];
    case 'Mass':
      return [
        {
          y: [],
          type: 'line',
          fill: 'tonexty',
          name: 'Mass',
          line: {
            color: '#CCCCCC',
            width: 3
          }
        },
        {
          y: [],
          type: 'line',
          fill: 'tonexty',
          name: 'Setpoint',
          line: {
            color: '#0aec5a',
            width: 3
          }
        }
      ];
    default:
      throw new Error('Incompatible type of chart in the argument');
  }
}

export default getTracesConfig;
