module.exports = {
    // controle por malha aberta 
    offControlling: function(value) {
        u = scale(value);
    
        // descomentar depois  
        // offInterval = setInterval(() => {
        //     arduino.analogWrite(9, scale(value));
        // }, 100);
    },
    // controle por liga/desliga 
    onOffControlling: function() {
        onOffInterval = setInterval(() => {
            u = getTemp() < setPoint ? 255 : 0;
    
            // descomentar depois
            // arduino.analogWrite(9, u);
        }, 100);
    },
    // controle por PID
    pidControlling: function() {
        pidInterval = setInterval(() => {
            const KP = 1 / 0.3, KI = KP / 1.27, H = 0.1, KD = KP * 6;
            let control = new Controller(KP, KI, KD, H);
            control.setTarget(setPoint);
            let output = getTemp();
            e = getTemp() - setPoint;
            u = control.update(output);
            if (u < 2 && setPoint > 30)
                u *= 1.05;
            if (u > 255)
                u = 255;
            else if (u < 0)
                u = 0;
            // descomentar depois
            // arduino.analogWrite(9, u);
        }, 100);
    },
}