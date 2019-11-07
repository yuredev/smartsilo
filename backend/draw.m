x = load("D:/Documentos/ProjetosWeb/SmartSilo/backend/hist.txt");
h = 0.1;
nAmostras = length(x(:,1));
tMax = nAmostras*h;
t = 0:h:tMax-h; % for t = 0; t <= tMax; t+=h                                         

fh = figure();

plot(t, x(:,1), t, x(:,4));
grid;
title('Controle de temperatura interna do silo');
xlabel('Tempo');
ylabel('oC');

%print(fh, "img.pdf", "-dpdflatexstandalone");
%system("pdflatex img");
print -dpng "D:/Documentos/ProjetosWeb/SmartSilo/frontend/img/chart.png";

close(fh); % destruir janela

%savefig('img.fig');
