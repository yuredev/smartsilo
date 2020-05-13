module.exports = {
    setSetPoint: function(newSetPoint, socket) {
        console.log(newSetPoint);
        setPoint = Number(newSetPoint); // garantir que será um número
        socket.emit('changeSetPoint', setPoint); // enviando para o cliente atual 
        socket.broadcast.emit('changeSetPoint', setPoint); // enviando o resto dos clientes
        console.log(`Setpoint changed to: ${setPoint}`);
    },
    startExperiment: function(controlMode) {
        dryertBusy = true;
        const time = new Date();
        fileName = `${time.getDate()}-${time.getMonth()+1}-${time.getUTCFullYear()}-${time.getHours()}-${time.getMinutes()}-${time.getSeconds()}`;
        startSaving(fileName);
        clearInterval(offInterval);
        clearInterval(onOffInterval);
        clearInterval(pidInterval);
        startControling(controlMode);
    },
    stopExperiment: function(controlMode) {
        dryertBusy = true;
        const time = new Date();
        fileName = `${time.getDate()}-${time.getMonth()+1}-${time.getUTCFullYear()}-${time.getHours()}-${time.getMinutes()}-${time.getSeconds()}`;
        startSaving(fileName);
        clearInterval(offInterval);
        clearInterval(onOffInterval);
        clearInterval(pidInterval);
        startControling(controlMode);
    },
    switchOffController: function() {
        offControlValue = offControlValue == 0 ? 3 : 0;
        clearInterval(offControling);
        offControling(offControlValue);
    },
}