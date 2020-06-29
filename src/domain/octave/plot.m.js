module.exports = `args = argv();

txtName = [args{1} ".txt"];
imgName = [args{1} ".png"];

readTxtPath = args{2};
saveImgPath = args{3};

x = load([readTxtPath "/" txtName]);

freq = 0.25;
nSamples = length(x(:,1));
maxTime = nSamples*freq;
% equivale a for t = 0; t <= tMax; t+=h        
% no octave arrays começam do 1    
t = 0: freq : maxTime-freq;                               

fh = figure();  

plot(t, x(:,1), 'r', t, x(:,4), 'b');
ylim([0 50]);

grid;
title('Controle de temperatura interna do silo');
xlabel('Tempo');
ylabel('oC');

print([saveImgPath "/" imgName], '-dpng');
 
% para Linux
system(["cp " saveImgPath "/" imgName " " saveImgPath "/" "__current-plot.png"]);
% para Windows
system(["copy " saveImgPath "\\\\" imgName " " saveImgPath "\\\\" "__current-plot.png"]);
    
close(fh); % destruir janela`;