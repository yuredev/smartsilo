const { shell } = require('electron');
      
window.onload = () => {
  const logo = document.getElementById('logo');
  const ufrnLogo = document.getElementById('ufrn-logo');
  const yureGit = document.getElementById('git-yure');
  const josenaldeLattes = document.getElementById('lattes-josenalde'); 
  const tapiocaPage = document.getElementById('tapioca-page');
  const eajPage = document.getElementById('eaj-page');

  logo.addEventListener('click', event => {
    event.preventDefault();
    shell.openExternal('http://smartsilo.netlify.app');
  });
  ufrnLogo.addEventListener('click', event => {
    event.preventDefault();
    shell.openExternal('https://ufrn.br/');
  });
  yureGit.addEventListener('click', event => {
    event.preventDefault();
    shell.openExternal('http://github.com/yuredev');
  });
  josenaldeLattes.addEventListener('click', event => {
    event.preventDefault();
    shell.openExternal('http://lattes.cnpq.br/0503501772199456');
  });
  tapiocaPage.addEventListener('click', () => {
    event.preventDefault();
    shell.openExternal('http://tapioca.eaj.ufrn.br/');
  });
  eajPage.addEventListener('click', () => {
    event.preventDefault();
    shell.openExternal('http://www.eaj.ufrn.br/site/');
  });
}