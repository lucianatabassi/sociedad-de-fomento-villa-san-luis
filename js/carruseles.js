/* ==========================================================================
   Sociedad de Fomento Villa San Luis — Carruseles
   - Instalaciones (3 carruseles): en mobile/tablet fija título, descripción, fondo verde y degradé y desliza solo las imágenes; en desktop muestra un <article> por vez usando [hidden]
   - Salón (solo mobile): las cards se deslizan con scroll-snap y las flechas avanzan de a una
   - Galería: desktop muestra anterior / actual / siguiente; mobile y tablet solo la actual
   Funciona con flechas, teclado (← →) y deslizando el dedo en pantallas táctiles.
   ========================================================================== */
(function () {
  'use strict';

  var UMBRAL_SWIPE = 50; // px mínimos de desplazamiento horizontal para contar como swipe

  /* Reinicia la animación de entrada de la diapositiva que aparece */
  function animarEntrada(el) {
    el.classList.remove('carrusel-entrando');
    void el.offsetWidth; // fuerza reflow para poder repetir la animación
    el.classList.add('carrusel-entrando');
    el.addEventListener('animationend', function fin() {
      el.classList.remove('carrusel-entrando');
      el.removeEventListener('animationend', fin);
    });
  }

  /* Swipe táctil + flechas del teclado sobre el contenedor del carrusel */
  function agregarInteraccion(contenedor, anterior, siguiente) {
    var x0 = 0, y0 = 0, punteroActivo = null;

    function finalizarSwipe(x1, y1) {
      var dx = x1 - x0;
      var dy = y1 - y0;
      if (Math.abs(dx) > UMBRAL_SWIPE && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) { siguiente(); } else { anterior(); }
      }
    }

    if (window.PointerEvent) {
      contenedor.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'touch' || e.target.closest('button')) { return; }
        punteroActivo = e.pointerId;
        x0 = e.clientX;
        y0 = e.clientY;
      }, { passive: true });
      contenedor.addEventListener('pointerup', function (e) {
        if (e.pointerId !== punteroActivo) { return; }
        punteroActivo = null;
        finalizarSwipe(e.clientX, e.clientY);
      }, { passive: true });
      contenedor.addEventListener('pointercancel', function () { punteroActivo = null; }, { passive: true });
    } else {
      contenedor.addEventListener('touchstart', function (e) {
        if (e.target.closest('button')) { return; }
        x0 = e.changedTouches[0].clientX;
        y0 = e.changedTouches[0].clientY;
      }, { passive: true });
      contenedor.addEventListener('touchend', function (e) {
        if (e.changedTouches.length) { finalizarSwipe(e.changedTouches[0].clientX, e.changedTouches[0].clientY); }
      }, { passive: true });
    }

    contenedor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { anterior(); }
      if (e.key === 'ArrowRight') { siguiente(); }
    });
  }

  /* ---------- Instalaciones ---------- */
  function iniciarInstalaciones(carrusel) {
    var slides = Array.prototype.slice.call(carrusel.querySelectorAll('.info-instalaciones'));
    var btnAnterior = carrusel.querySelector('.flecha-izq-carrusel');
    var btnSiguiente = carrusel.querySelector('.flecha-der-carrusel');
    if (slides.length < 2 || !btnAnterior || !btnSiguiente) { return; }

    // En mobile/tablet: el encabezado (título y descripción), el fondo verde y el degradé
    // quedan fijos; únicamente las imágenes se deslizan dentro de una pista horizontal.
    if (window.matchMedia('(max-width: 1279px)').matches) {
      var encabezadoFijo = document.createElement('div');
      encabezadoFijo.className = 'encabezado-fijo-instalaciones';

      var tituloFijo = document.createElement('h3');
      tituloFijo.className = 'titulo-carrusel-instalaciones';

      var descFija = document.createElement('p');
      descFija.className = 'descripcion-carrusel-instalaciones';

      encabezadoFijo.appendChild(tituloFijo);
      encabezadoFijo.appendChild(descFija);

      var zonaFotos = document.createElement('div');
      zonaFotos.className = 'zona-fotos-instalaciones';

      var pista = document.createElement('div');
      pista.className = 'pista-imagenes-instalaciones';

      var degradeFijo = document.createElement('span');
      degradeFijo.className = 'degrade-fijo-instalaciones';
      degradeFijo.setAttribute('aria-hidden', 'true');

      var datosSlides = slides.map(function (slide) {
        var t = slide.querySelector('.titulo-carrusel-instalaciones');
        var d = slide.querySelector('.descripcion-carrusel-instalaciones');
        var img = slide.querySelector('.img-instalaciones');
        if (img) {
          pista.appendChild(img);
        }
        return {
          titulo: t ? t.textContent : '',
          descripcion: d ? d.textContent : ''
        };
      });

      zonaFotos.appendChild(pista);
      zonaFotos.appendChild(degradeFijo);
      zonaFotos.appendChild(btnAnterior);
      zonaFotos.appendChild(btnSiguiente);

      var totalFotos = pista.querySelectorAll('.img-instalaciones').length;
      var actualScroll = 0;

      function sincronizarTexto(indice) {
        var idx = ((indice % datosSlides.length) + datosSlides.length) % datosSlides.length;
        tituloFijo.textContent = datosSlides[idx].titulo;
        descFija.textContent = datosSlides[idx].descripcion;
      }

      sincronizarTexto(0);

      carrusel.appendChild(encabezadoFijo);
      carrusel.appendChild(zonaFotos);

      function pasoInstalaciones() { return pista.clientWidth; }

      function irSlide(indice) {
        actualScroll = (indice + totalFotos) % totalFotos;
        sincronizarTexto(actualScroll);
        var reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        pista.scrollTo({ left: actualScroll * pasoInstalaciones(), behavior: reducir ? 'auto' : 'smooth' });
      }

      pista.addEventListener('scroll', function () {
        var nuevoIdx = Math.round(pista.scrollLeft / Math.max(1, pasoInstalaciones()));
        if (nuevoIdx !== actualScroll && nuevoIdx >= 0 && nuevoIdx < totalFotos) {
          actualScroll = nuevoIdx;
          sincronizarTexto(actualScroll);
        }
      }, { passive: true });

      btnAnterior.addEventListener('click', function () { irSlide(actualScroll - 1); });
      btnSiguiente.addEventListener('click', function () { irSlide(actualScroll + 1); });
      carrusel.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { irSlide(actualScroll - 1); }
        if (e.key === 'ArrowRight') { irSlide(actualScroll + 1); }
      });
      return;
    }

    var actual = 0;
    slides.forEach(function (s, i) { if (!s.hidden) { actual = i; } });
    function mostrar(indice) {
      actual = (indice + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.hidden = i !== actual; });
      animarEntrada(slides[actual]);
    }
    function anterior() { mostrar(actual - 1); }
    function siguiente() { mostrar(actual + 1); }
    btnAnterior.addEventListener('click', anterior);
    btnSiguiente.addEventListener('click', siguiente);
    agregarInteraccion(carrusel, anterior, siguiente);
  }

  /* ---------- Galería ---------- */
  function iniciarGaleria(carrusel) {
    var lista = carrusel.querySelector('ul');
    var items = Array.prototype.slice.call(carrusel.querySelectorAll('ul > li'));
    var btnAnterior = carrusel.querySelector('.flecha-izq-carrusel');
    var btnSiguiente = carrusel.querySelector('.flecha-der-carrusel');
    if (items.length < 2 || !lista || !btnAnterior || !btnSiguiente) { return; }

    // En mobile la lista se desplaza de forma nativa y continua, con snap al soltar.
    if (window.matchMedia('(max-width: 767px)').matches) {
      var actualScroll = 0;
      items.forEach(function (item) { item.classList.remove('is-previa', 'is-siguiente'); });
      function pasoGaleria() { return lista.clientWidth; }
      function irImagen(indice) {
        actualScroll = (indice + items.length) % items.length;
        var reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        lista.scrollTo({ left: actualScroll * pasoGaleria(), behavior: reducir ? 'auto' : 'smooth' });
      }
      lista.addEventListener('scroll', function () {
        actualScroll = Math.round(lista.scrollLeft / Math.max(1, pasoGaleria()));
      }, { passive: true });
      btnAnterior.addEventListener('click', function () { irImagen(actualScroll - 1); });
      btnSiguiente.addEventListener('click', function () { irImagen(actualScroll + 1); });
      carrusel.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { irImagen(actualScroll - 1); }
        if (e.key === 'ArrowRight') { irImagen(actualScroll + 1); }
      });
      return;
    }

    var actual = 0;
    function render() {
      var n = items.length;
      var previa = (actual - 1 + n) % n;
      var siguiente = (actual + 1) % n;
      items.forEach(function (li, i) {
        li.classList.toggle('is-activa', i === actual);
        li.classList.toggle('is-previa', i === previa);
        li.classList.toggle('is-siguiente', i === siguiente);
      });
      animarEntrada(items[actual]);
    }
    function ir(indice) { actual = (indice + items.length) % items.length; render(); }
    function anterior() { ir(actual - 1); }
    function siguiente() { ir(actual + 1); }
    btnAnterior.addEventListener('click', anterior);
    btnSiguiente.addEventListener('click', siguiente);
    agregarInteraccion(carrusel, anterior, siguiente);
    render();
  }

  /* ---------- Salón (solo mobile: en tablet/desktop las cards son una grilla) ---------- */
  function iniciarSalon(carrusel) {
    var pista = carrusel.querySelector('.contenedor-cards-salon');
    var cards = pista ? Array.prototype.slice.call(pista.querySelectorAll('.card-salon')) : [];
    var btnAnterior = carrusel.querySelector('.flecha-izq-carrusel');
    var btnSiguiente = carrusel.querySelector('.flecha-der-carrusel');
    if (cards.length < 2 || !btnAnterior || !btnSiguiente) { return; }

    var actual = 0;

    // Distancia entre el inicio de una card y la siguiente (ancho + gap)
    function paso() {
      var gap = parseFloat(window.getComputedStyle(pista).columnGap) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    }

    // Mantiene el índice sincronizado también cuando se desliza con el dedo
    pista.addEventListener('scroll', function () {
      actual = Math.round(pista.scrollLeft / paso());
    }, { passive: true });

    function ir(indice) {
      var n = cards.length;
      actual = (indice + n) % n; // circular
      var reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      pista.scrollTo({ left: actual * paso(), behavior: reducir ? 'auto' : 'smooth' });
    }
    function anterior() { ir(actual - 1); }
    function siguiente() { ir(actual + 1); }

    btnAnterior.addEventListener('click', anterior);
    btnSiguiente.addEventListener('click', siguiente);

    carrusel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { anterior(); }
      if (e.key === 'ArrowRight') { siguiente(); }
    });
  }

  document.querySelectorAll('.carrusel-instalaciones').forEach(iniciarInstalaciones);
  document.querySelectorAll('.carrusel-galeria').forEach(iniciarGaleria);
  document.querySelectorAll('.carrusel-salon').forEach(iniciarSalon);
})();