x = load("D:/Documentos/ProjetosWeb/SmartSilo/backend/hist.txt");
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

print -dpng "D:/Documentos/ProjetosWeb/SmartSilo/frontend/img/chart.png";

close(fh); % destruir janela