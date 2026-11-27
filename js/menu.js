/* ==========================================================================
   Sociedad de Fomento Villa San Luis — Menú hamburguesa (mobile y tablet)
   Abre/cierra el menú con el botón, y lo cierra al elegir un link,
   tocar afuera, apretar Esc o pasar a desktop (≥ 1280px).
   ========================================================================== */
(function () {
  'use strict';

  var boton = document.querySelector('.icono-menu');
  var menu = document.querySelector('.menu-hamburguesa');
  if (!boton || !menu) { return; }

  var icono = boton.querySelector('img');
  var desktop = window.matchMedia('(min-width: 1280px)');

  function estaAbierto() {
    return boton.getAttribute('aria-expanded') === 'true';
  }

  function alternar(abrir) {
    boton.setAttribute('aria-expanded', String(abrir));
    if (icono) { icono.alt = abrir ? 'Cerrar menú' : 'Abrir menú'; }
  }

  boton.addEventListener('click', function () {
    alternar(!estaAbierto());
  });

  // Al elegir una sección, el menú se cierra
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) { alternar(false); }
  });

  // Tocar fuera del header cierra el menú
  document.addEventListener('click', function (e) {
    if (estaAbierto() && !e.target.closest('.encabezado')) { alternar(false); }
  });

  // Esc cierra y devuelve el foco al botón
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && estaAbierto()) {
      alternar(false);
      boton.focus();
    }
  });

  // Al pasar a desktop el menú vuelve a ser la barra horizontal: se resetea el estado
  function alCambiarAncho(e) {
    if (e.matches) { alternar(false); }
  }
  if (desktop.addEventListener) {
    desktop.addEventListener('change', alCambiarAncho);
  } else {
    desktop.addListener(alCambiarAncho); // Safari viejo
  }
})();
