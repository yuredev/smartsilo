const socket = io();
function setPins() {
    try {
        let pin1 = $('input[name="firstPin"]:checked').val();
        let pin2 = $('input[name="secondPin"]:checked').val();
        let pin3 = $('input[name="thirdPin"]:checked').val();
        let pin4 = $('input[name="fourthPin"]:checked').val();
        let pin5 = $('input[name="fifthPin"]:checked').val();
        if (isEqual([pin1, pin2, pin3, pin4, pin5])) {
            errorMsg();
        } else {
            socket.emit('setPins', [pin1, pin2, pin3, pin4, pin5]);
            window.location.href = 'index.html';
        }
    } catch (e) {
        errorMsg();
    }
}
function isEqual(pins) {
    for (let i = 0; i < pins.length; i++) {
        for (let j = i + 1; j < pins.length; j++) {
            if (pins[i] == pins[j]) {
                return true;
            }
        }
    }
    return false;
}
const errorMsg = () => $('h2').text('Preencha todos os canais devidamente').css('color', 'red').fadeTo(2000);