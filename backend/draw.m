args = argv();

txtName = [args{1} ".txt"];
imgName = [args{1} ".png"];

x = load(["experiments/read/" txtName]);

freq = 0.25;
nSamples = length(x(:,1));
maxTime = nSamples*freq;
% equivale a for t = 0; t <= tMax; t+=h        
% no octave arrays começam do 1    
t = 0: freq : maxTime-freq;                               

fh = figure();  

plot(t, x(:,1), 'r', t, x(:,4), 'b');

grid;
title('Controle de temperatura interna do silo');
xlabel('Tempo');
ylabel('oC');

print -dpng "frontend/img/chart.png";

system(["copy frontend\\img\\chart.png " "experiments\\samples\\" imgName]) || system(["cp frontend\\img\\chart.png " "experiments\\samples\\" imgName]);

close(fh); % destruir janela