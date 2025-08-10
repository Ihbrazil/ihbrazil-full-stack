// js/depoimentosAutomaticos.js
// Seleciona todos os depoimentos e inicia o ciclo de troca
const depoimentos = document.querySelectorAll('.depoimento');
let index = 0;

function trocarDepoimento() {
depoimentos.forEach((depoimento, i) => {
    depoimento.style.display = i === index ? 'block' : 'none';
});
index = (index + 1) % depoimentos.length;
}

setInterval(trocarDepoimento, 4000);
window.addEventListener('load', trocarDepoimento);
