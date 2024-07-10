let outputToCopy;
const priceListGalpon = {
  area: [50, 100, 150, 200, 250, 300, 350, 400, 500, 600, 700, 800, 900, 1000],
  precio: [
    176, 160, 155, 152, 150, 148, 147, 146, 144, 142, 140, 138, 137, 136,
  ],
};

const priceListTinglado = {
  area: [50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000],
  precio: [110, 105, 96, 92, 88, 86, 84, 82, 80, 78, 76, 74],
};

function interp1d(x, y) {
  return function (xp) {
    if (xp <= x[0]) return y[0];
    if (xp >= x[x.length - 1]) return y[y.length - 1];
    let i = 1;
    while (xp > x[i]) i++;
    let xL = x[i - 1],
      yL = y[i - 1],
      xR = x[i],
      yR = y[i];
    return yL + ((xp - xL) / (xR - xL)) * (yR - yL);
  };
}

function calcularCosto() {
  const estructura = document.getElementById("estructura").value;
  const material = document.getElementById("material").value;
  const ancho = parseFloat(document.getElementById("ancho").value);
  const largo = parseFloat(document.getElementById("largo").value);
  const alto = parseFloat(document.getElementById("alto").value);
  const cerramiento = parseFloat(document.getElementById("cerramiento").value);
  const tipoCambio = parseFloat(document.getElementById("tipo_cambio").value);
  const porcentajeAdicional = parseFloat(
    document.getElementById("porcentaje").value
  );
  const km = parseFloat(document.getElementById("km").value);

  const areaPiso = ancho * largo;
  const perimetro = 2 * (ancho + largo);
  const areaParedes = perimetro * alto;
  const areaTotal = areaPiso + areaParedes;

  const priceList =
    estructura === "Galpón" ? priceListGalpon : priceListTinglado;
  const interp = interp1d(priceList.area, priceList.precio);
  let precioPorMetro = interp(areaPiso);

  if (estructura === "Tinglado" && areaPiso >= 1000) {
    precioPorMetro = Math.max(precioPorMetro, 74);
  }

  if (material === "Perfil U Ángulo") {
    precioPorMetro += 24;
  } else if (material === "Alma Llena") {
    precioPorMetro += 48;
  }

  const numColumnasLargo = Math.floor(largo / 5) + 1;
  const totalColumnas = numColumnasLargo * 2;
  const precioColumna =
    material === "Hierro Torsionado"
      ? 38
      : material === "Perfil U Ángulo"
      ? 76
      : 160;
  const costoColumnas =
    alto === 5
      ? 0
      : totalColumnas *
        Math.abs(alto - 5) *
        precioColumna *
        (alto > 5 ? 1 : -1);
  const costoCerramiento =
    estructura === "Tinglado"
      ? 0
      : Math.abs(cerramiento - 4.5) *
        perimetro *
        27 *
        (cerramiento > 4.5 ? 1 : -1);

  const costoPiso = areaPiso * precioPorMetro;
  let precioTotal = costoPiso + costoColumnas + costoCerramiento;

  const costoKm = km * (areaPiso <= 300 ? 1.8 : areaPiso <= 800 ? 2.1 : 4.2);
  const costoKmArs = costoKm * tipoCambio;

  precioTotal += costoKm;

  const precioTotalArs = precioTotal * tipoCambio;
  const precioFinalArs = precioTotalArs * (1 + porcentajeAdicional / 100);

  const precioTotalArsFormateado = precioTotalArs
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const precioFinalArsFormateado = precioFinalArs
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const costoKmArsFormateado = costoKmArs
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  document.getElementById("output").innerHTML = `<h2>Cotización</h2>
<p>Área del piso: <span>${areaPiso} m²<span><p/>
<p>Perímetro del galpón: <span>${perimetro} m<span><p/>
<p>Número total de columnas: <span>${totalColumnas}<span><p/>
<p>Área de las paredes: <span>${areaParedes} m²<span><p/>
<p>Área total: <span>${areaTotal} m²<span><p/>
<p>Estructura seleccionada: <span>${estructura}<span><p/>
<p>Material seleccionado: <span>${material}<span><p/>
<p>Precio por metro cuadrado de piso: <span>${precioPorMetro.toFixed(
    2
  )} USD/m²<span><p/>
<p>Costo adicional/reducción por columnas: <span>${costoColumnas.toFixed(
    2
  )} USD<span><p/>
<p>Costo del cerramiento: <span>${costoCerramiento.toFixed(2)} USD<span><p/>
<p>Costo de los kilómetros en ARS: <span>${costoKmArsFormateado} ARS<span><p/>
<p>Precio total en USD: <span>${precioTotal.toFixed(2)} USD<span><p/>
<p>Precio total en ARS: <span>${precioTotalArsFormateado} ARS<span><p/>
<p>Precio final con porcentaje adicional en ARS: <span>${precioFinalArsFormateado} ARS<span><p/>`;

  outputToCopy = `$${precioFinalArsFormateado}`;
}

async function copiarPrecio() {
  if (!outputToCopy) {
    alert("Debes realizar una cotización antes de copiar el precio");
    return;
  }
  try {
    await navigator.clipboard.writeText(outputToCopy);
  } catch (error) {
    console.error(error.message);
  }
}
