args = argv();

txtName = [args{1} ".txt"];
imgName = [args{1} ".png"];

x = load(["experiments/data/" txtName]);

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

% compatibilidade com Windows e Linux 

if (uname().sysname == 'Linux') 
    system(["cp frontend/img/chart.png " "experiments/" imgName]);
else     
    system(["copy frontend\\img\\chart.png " "experiments\\" imgName]);
endif    

close(fh); % destruir janela