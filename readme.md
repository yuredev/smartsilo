# ⚙  SmartSilo  🌱 </h1>

### About:

SmartSilo is a research project from the Federal University of Rio Grande do Norte that consists in a idea of software to monitor and control the drying proccess of grains and seeds within storage silos. <br />
<br />
At the moment, the software is able to connect to an Arduino board and make a PID control of the temperature inside the silo, based on the temperature chosen by the user. This is possible thanks to the capture of sensor signals inside the silo that are directly connected to the board. This projects will soon aso include a mass and umildity controller and monitor.


### Justification:

With the increase in productivity presented by the grain sector in the country, the need for not only storage places for products, but for them to be optimized to provide greater durability of these products, is of national and strategic interest for the primary economy chain. This project will allow the development of an aeration / drying control system in grain storage silos, with the use of instrumentation in the Internet of Things (IoT) context, with the possibility not only of monitoring but of controlling variables remotely, for maintenance humidity / temperature levels suitable for each type of grain and microclimate conditions inside and outside the silo installation site.

<hr>

Developed mainly in the <a href="http://tapioca.eaj.ufrn.br/?page_id=50&lang=en">TAPIOCA-LAB</a> from the <a>Federal University of Rio Grande do Norte.</a> 

Access the <a href="https://smartsilo.netlify.com/">Oficial project website</a>

<div 
    style="display: flex; flex-wrap: wrap; justify-content:space-around; align-itens: center;"
>
    <img src="./__readme/demo.gif" width="65%" style="margin:10px">
    <img src="./__readme/dryer.PNG" width="25%" style="margin:10px">

</div>

### 🛠️ Built with:

- Node.js
- Express
- Vue.js
- Electron
- Socket.io
- Firmata.js
- Node-pid-controller
- Axios
- Plotly.js
- SweetAlerts.js
- Octave-cli
- Arduino board