import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { collection, getDocs } from 'firebase/firestore';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { FIRESTORE } from '../../core/firebase.providers';
import {
  AGOTAMIENTO_OPCIONES, AREA_OPCIONES, ASPECTO_NEGATIVO_OPCIONES, ASPECTO_POSITIVO_OPCIONES,
  COLORES_CATEGORICOS, COLOR_BARRA, COMPRENSION_IA_OPCIONES, DEPENDENCIA_OPCIONES,
  EDAD_OPCIONES, FRECUENCIA_IA_OPCIONES, GENERO_OPCIONES, HERRAMIENTAS_LABELS,
  HORAS_ESTUDIO_OPCIONES, HORAS_OCIO_OPCIONES, HORAS_SUENO_OPCIONES, HORAS_TRABAJO_OPCIONES,
  INTEGRAR_IA_OPCIONES, LIKERT_OPCIONES, Opcion, OpcionEtiquetada, PROPOSITOS_LABELS,
  RespuestaEncuesta, SEMESTRE_OPCIONES, SITUACION_OPCIONES, UTILIZA_IA_OPCIONES,
} from './dashboard.constants';
import {
  CampoMultiSelect, Comparador, FiltrosDatos, GRUPOS_FILTRO_DATOS, GrupoFiltroDatos,
  bucketsQueCalifican, filtrosVacios, hayFiltrosActivos, respuestaCumpleFiltros,
} from './dashboard.filters';

interface Tarjeta {
  id: number;
  titulo: string;
  tipo: 'pie' | 'bar' | 'texto';
  data?: ChartData<any, number[], string>;
  options?: ChartOptions<any>;
  alto: number;
  textos?: string[];
  /** Campo de `RespuestaEncuesta` que representa esta tarjeta, usado para saber qué grupo de segmentación de datos le corresponde. */
  campo?: keyof RespuestaEncuesta;
}

interface Seccion {
  titulo: string;
  tarjetas: Tarjeta[];
}

function esOpcionEtiquetada(o: Opcion | OpcionEtiquetada): o is OpcionEtiquetada {
  return typeof o !== 'string';
}

function contarOpciones(
  respuestas: RespuestaEncuesta[],
  campo: keyof RespuestaEncuesta,
  opciones: (Opcion | OpcionEtiquetada)[],
): { labels: string[]; valores: number[] } {
  const conteo = new Map<string, number>();
  for (const r of respuestas) {
    const valor = r[campo] as unknown as string;
    if (valor) conteo.set(valor, (conteo.get(valor) ?? 0) + 1);
  }
  return {
    labels: opciones.map((o) => (esOpcionEtiquetada(o) ? o.label : o)),
    valores: opciones.map((o) => conteo.get(esOpcionEtiquetada(o) ? o.value : o) ?? 0),
  };
}

function contarCheckboxGroup(
  respuestas: RespuestaEncuesta[],
  grupo: 'herramientas' | 'propositos',
  etiquetas: { key: string; label: string }[],
  campoOtra: 'isOtraHerramienta' | 'isOtroProposito',
): { labels: string[]; valores: number[] } {
  const conteo = new Map<string, number>(etiquetas.map((e) => [e.key, 0]));
  let otras = 0;
  for (const r of respuestas) {
    const seleccion = r[grupo] as unknown as Record<string, boolean> | undefined;
    for (const e of etiquetas) {
      if (seleccion?.[e.key]) conteo.set(e.key, (conteo.get(e.key) ?? 0) + 1);
    }
    if (r[campoOtra]) otras++;
  }
  return {
    labels: [...etiquetas.map((e) => e.label), 'Otra'],
    valores: [...etiquetas.map((e) => conteo.get(e.key) ?? 0), otras],
  };
}

function contarCarreras(respuestas: RespuestaEncuesta[]): { labels: string[]; valores: number[] } {
  const conteo = new Map<string, number>();
  for (const r of respuestas) {
    if (r.carrera) conteo.set(r.carrera, (conteo.get(r.carrera) ?? 0) + 1);
  }
  const entradas = [...conteo.entries()].sort((a, b) => b[1] - a[1]);
  return { labels: entradas.map((e) => e[0]), valores: entradas.map((e) => e[1]) };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private firestore = inject(FIRESTORE);

  cargando = signal(true);
  error = signal<string | null>(null);
  private respuestas = signal<RespuestaEncuesta[]>([]);

  totalRespuestas = computed(() => this.respuestas().length);

  // --- Estado del panel de filtros de visibilidad de preguntas ---
  panelAbierto = signal(true);
  busqueda = signal('');
  seleccionadas = signal<Set<number>>(new Set());

  // --- Estado del panel de segmentación de datos (qué estudiantes se cuentan) ---
  panelDatosAbierto = signal(false);
  filtrosDatos = signal<FiltrosDatos>(filtrosVacios());
  busquedaCarrera = signal('');
  private umbralInputs = signal<Partial<Record<CampoMultiSelect, number | null>>>({});
  readonly gruposFiltroDatos: GrupoFiltroDatos[] = GRUPOS_FILTRO_DATOS;

  respuestasFiltradas = computed<RespuestaEncuesta[]>(() => {
    const filtros = this.filtrosDatos();
    return this.respuestas().filter((r) => respuestaCumpleFiltros(r, filtros));
  });

  totalFiltradas = computed(() => this.respuestasFiltradas().length);
  hayFiltrosDatosActivos = computed(() => hayFiltrosActivos(this.filtrosDatos()));

  private readonly pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#374151',
          usePointStyle: true,
          boxWidth: 8,
          padding: 12,
          generateLabels: (chart) => {
            const data = chart.data;
            const dataset = data.datasets[0];
            const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
            return (data.labels as string[]).map((label, i) => {
              const valor = (dataset.data as number[])[i];
              const porcentaje = total > 0 ? Math.round((valor / total) * 100) : 0;
              return {
                text: `${label} (${valor} · ${porcentaje}%)`,
                fillStyle: (dataset.backgroundColor as string[])[i],
                strokeStyle: (dataset.backgroundColor as string[])[i],
                index: i,
              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const valores = ctx.dataset.data as number[];
            const total = valores.reduce((a, b) => a + b, 0);
            const valor = valores[ctx.dataIndex];
            const porcentaje = total > 0 ? Math.round((valor / total) * 100) : 0;
            return ` ${ctx.label}: ${valor} (${porcentaje}%)`;
          },
        },
      },
    },
  };

  private readonly barOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.formattedValue} respuestas`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#4b5563', precision: 0 },
        grid: { color: '#e5e7eb' },
      },
      y: {
        ticks: { color: '#374151' },
        grid: { display: false },
      },
    },
  };

  private pieData(labels: string[], valores: number[]): ChartData<'pie', number[], string> {
    return {
      labels,
      datasets: [{ data: valores, backgroundColor: COLORES_CATEGORICOS.slice(0, labels.length) }],
    };
  }

  private barData(labels: string[], valores: number[]): ChartData<'bar', number[], string> {
    return {
      labels,
      datasets: [{ data: valores, backgroundColor: COLOR_BARRA, borderRadius: 4, maxBarThickness: 28 }],
    };
  }

  private alto(nCategorias: number): number {
    return Math.max(220, 40 + nCategorias * 34);
  }

  private tarjetaPastel(id: number, titulo: string, campo: keyof RespuestaEncuesta, opciones: (Opcion | OpcionEtiquetada)[], respuestas: RespuestaEncuesta[]): Tarjeta {
    const { labels, valores } = contarOpciones(respuestas, campo, opciones);
    return { id, titulo, tipo: 'pie', data: this.pieData(labels, valores), options: this.pieOptions, alto: 280, campo };
  }

  private tarjetaBarras(id: number, titulo: string, campo: keyof RespuestaEncuesta, opciones: (Opcion | OpcionEtiquetada)[], respuestas: RespuestaEncuesta[]): Tarjeta {
    const { labels, valores } = contarOpciones(respuestas, campo, opciones);
    return { id, titulo, tipo: 'bar', data: this.barData(labels, valores), options: this.barOptions, alto: this.alto(labels.length), campo };
  }

  private tarjetaBarrasDesde(id: number, titulo: string, labels: string[], valores: number[], campo?: keyof RespuestaEncuesta): Tarjeta {
    return { id, titulo, tipo: 'bar', data: this.barData(labels, valores), options: this.barOptions, alto: this.alto(labels.length), campo };
  }

  private tarjetaTexto(id: number, titulo: string, textos: string[]): Tarjeta {
    return { id, titulo, tipo: 'texto', textos, alto: 0 };
  }

  secciones = computed<Seccion[]>(() => {
    const r = this.respuestasFiltradas();
    if (r.length === 0) return [];

    return [
      {
        titulo: 'Información general',
        tarjetas: [
          this.tarjetaPastel(1, '1. Edad', 'edad', EDAD_OPCIONES, r),
          this.tarjetaPastel(2, '2. Género', 'genero', GENERO_OPCIONES, r),
          ((): Tarjeta => {
            const { labels, valores } = contarCarreras(r);
            return this.tarjetaBarrasDesde(3, '3. Carrera universitaria', labels, valores, 'carrera');
          })(),
          this.tarjetaBarras(4, '4. Semestre actual', 'semestre', SEMESTRE_OPCIONES, r),
          this.tarjetaPastel(5, '5. Situación actual', 'situacionSeleccionada', SITUACION_OPCIONES, r),
        ],
      },
      {
        titulo: 'Distribución del tiempo',
        tarjetas: [
          this.tarjetaBarras(6, '6. Horas de estudio al día', 'horasEstudio', HORAS_ESTUDIO_OPCIONES, r),
          this.tarjetaBarras(7, '7. Horas de trabajo al día', 'horasTrabajo', HORAS_TRABAJO_OPCIONES, r),
          this.tarjetaBarras(8, '8. Horas de ocio al día', 'horasOcio', HORAS_OCIO_OPCIONES, r),
          this.tarjetaBarras(9, '9. Horas de sueño al día', 'horasSueno', HORAS_SUENO_OPCIONES, r),
        ],
      },
      {
        titulo: 'Uso de herramientas de IA',
        tarjetas: [
          this.tarjetaPastel(10, '10. ¿Utiliza IA para actividades académicas?', 'utilizaIa', UTILIZA_IA_OPCIONES, r),
          this.tarjetaBarras(11, '11. Frecuencia de uso de IA', 'frecuenciaIa', FRECUENCIA_IA_OPCIONES, r),
          ((): Tarjeta => {
            const { labels, valores } = contarCheckboxGroup(r, 'herramientas', HERRAMIENTAS_LABELS, 'isOtraHerramienta');
            return this.tarjetaBarrasDesde(12, '12. Herramientas de IA utilizadas', labels, valores, 'herramientas');
          })(),
          ((): Tarjeta => {
            const { labels, valores } = contarCheckboxGroup(r, 'propositos', PROPOSITOS_LABELS, 'isOtroProposito');
            return this.tarjetaBarrasDesde(13, '13. Propósitos de uso de IA', labels, valores, 'propositos');
          })(),
          this.tarjetaBarras(14, '14. La IA ayuda a ahorrar tiempo académico', 'ahorroTiempo', LIKERT_OPCIONES, r),
        ],
      },
      {
        titulo: 'Desgaste académico',
        tarjetas: [
          this.tarjetaBarras(15, '15. Frecuencia de agotamiento académico', 'agotamiento', AGOTAMIENTO_OPCIONES, r),
          this.tarjetaBarras(16, '16. La carga académica afecta la salud emocional', 'saludEmocional', LIKERT_OPCIONES, r),
          this.tarjetaBarras(17, '17. La IA reduce el estrés académico', 'estresIa', LIKERT_OPCIONES, r),
          this.tarjetaBarras(18, '18. La IA ayuda a comprender mejor los temas', 'comprensionIa', COMPRENSION_IA_OPCIONES, r),
          this.tarjetaPastel(19, '19. ¿El uso excesivo de IA genera dependencia?', 'dependencia', DEPENDENCIA_OPCIONES, r),
        ],
      },
      {
        titulo: 'Análisis comparativo',
        tarjetas: [
          this.tarjetaBarras(20, '20. Área académica con más uso de IA', 'areaSeleccionada', AREA_OPCIONES, r),
          this.tarjetaBarras(21, '21. La IA mejora la productividad académica', 'productividad', LIKERT_OPCIONES, r),
          this.tarjetaPastel(22, '22. ¿Las universidades deberían integrar IA oficialmente?', 'integrarIa', INTEGRAR_IA_OPCIONES, r),
          this.tarjetaBarras(23, '23. Aspecto más positivo del uso de IA', 'aspectoPositivoSeleccionado', ASPECTO_POSITIVO_OPCIONES, r),
          this.tarjetaBarras(24, '24. Aspecto más negativo del uso de IA', 'aspectoNegativoSeleccionado', ASPECTO_NEGATIVO_OPCIONES, r),
        ],
      },
      {
        titulo: 'Comentarios abiertos',
        tarjetas: [
          this.tarjetaTexto(
            25,
            '25. Experiencia y sugerencias',
            r.map((x) => x.experienciaAbierta).filter((t) => !!t && t.trim() !== ''),
          ),
        ],
      },
    ];
  });


  totalPreguntas = computed(() => this.secciones().reduce((acc, s) => acc + s.tarjetas.length, 0));
  totalSeleccionadas = computed(() => this.seleccionadas().size);
  todoSeleccionado = computed(() => this.totalPreguntas() > 0 && this.totalSeleccionadas() === this.totalPreguntas());

  /**
   * Sin ninguna pregunta seleccionada se muestran TODAS (no restringe nada); seleccionar
   * una o más preguntas/secciones sí filtra a solo esas. "Quitar todas" por tanto vuelve
   * a mostrarlo todo, en vez de vaciar el dashboard.
   */
  seccionesVisibles = computed<Seccion[]>(() => {
    const sel = this.seleccionadas();
    if (sel.size === 0) return this.secciones();
    return this.secciones()
      .map((s) => ({ titulo: s.titulo, tarjetas: s.tarjetas.filter((t) => sel.has(t.id)) }))
      .filter((s) => s.tarjetas.length > 0);
  });

  /**
   * Campos de segmentación relevantes según las preguntas actualmente seleccionadas.
   * `null` = sin restricción (nada seleccionado → todas las preguntas se muestran, así
   * que todos los grupos de segmentación también aplican).
   */
  camposActivosSegunSeleccion = computed<Set<string> | null>(() => {
    const sel = this.seleccionadas();
    if (sel.size === 0) return null;
    const campos = new Set<string>();
    for (const seccion of this.secciones()) {
      for (const t of seccion.tarjetas) {
        if (sel.has(t.id) && t.campo) campos.add(t.campo);
      }
    }
    return campos;
  });

  grupoRelevante(campo: CampoMultiSelect): boolean {
    const activos = this.camposActivosSegunSeleccion();
    return activos === null || activos.has(campo);
  }

  semestreRelevante(): boolean {
    const activos = this.camposActivosSegunSeleccion();
    return activos === null || activos.has('semestre');
  }

  gruposFiltroVisibles = computed<GrupoFiltroDatos[]>(() =>
    this.gruposFiltroDatos.filter((g) => this.grupoRelevante(g.campo)),
  );

  estaSeleccionada(id: number): boolean {
    return this.seleccionadas().has(id);
  }

  coincideBusqueda(titulo: string): boolean {
    const q = this.busqueda().trim().toLowerCase();
    return !q || titulo.toLowerCase().includes(q);
  }

  grupoTieneCoincidencias(seccion: Seccion): boolean {
    return seccion.tarjetas.some((t) => this.coincideBusqueda(t.titulo));
  }

  hayCoincidencias(): boolean {
    return this.secciones().some((s) => this.grupoTieneCoincidencias(s));
  }

  preguntasActivas = computed<{ id: number; titulo: string }[]>(() => {
    const sel = this.seleccionadas();
    return this.secciones()
      .flatMap((s) => s.tarjetas)
      .filter((t) => sel.has(t.id))
      .map((t) => ({ id: t.id, titulo: t.titulo }));
  });

  toggleFiltro(id: number) {
    const nuevo = new Set(this.seleccionadas());
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    this.seleccionadas.set(nuevo);
  }

  seleccionarTodas() {
    const ids = this.secciones().flatMap((s) => s.tarjetas.map((t) => t.id));
    this.seleccionadas.set(new Set(ids));
  }

  quitarTodas() {
    this.seleccionadas.set(new Set());
  }

  seccionCompleta(seccion: Seccion): boolean {
    return seccion.tarjetas.length > 0 && seccion.tarjetas.every((t) => this.seleccionadas().has(t.id));
  }

  toggleSeccion(seccion: Seccion) {
    const completa = this.seccionCompleta(seccion);
    const nuevo = new Set(this.seleccionadas());
    for (const t of seccion.tarjetas) {
      if (completa) nuevo.delete(t.id);
      else nuevo.add(t.id);
    }
    this.seleccionadas.set(nuevo);
  }

  togglePanel() {
    this.panelAbierto.update((v) => !v);
  }

  // --- Filtro de segmentación de datos ---

  togglePanelDatos() {
    this.panelDatosAbierto.update((v) => !v);
  }

  estaFiltroDatoActivo(campo: CampoMultiSelect, valor: string): boolean {
    return (this.filtrosDatos()[campo] as Set<string>).has(valor);
  }

  toggleFiltroDato(campo: CampoMultiSelect, valor: string) {
    this.filtrosDatos.update((f) => {
      const actual = new Set(f[campo] as Set<string>);
      if (actual.has(valor)) actual.delete(valor);
      else actual.add(valor);
      return { ...f, [campo]: actual };
    });
  }

  cantidadActivaEnGrupo(campo: CampoMultiSelect): number {
    return (this.filtrosDatos()[campo] as Set<string>).size;
  }

  coincideBusquedaCarrera(label: string): boolean {
    const q = this.busquedaCarrera().trim().toLowerCase();
    return !q || label.toLowerCase().includes(q);
  }

  setSemestreMin(valor: string | number | null) {
    const n = valor == null || String(valor).trim() === '' ? null : Number(valor);
    this.filtrosDatos.update((f) => ({ ...f, semestreMin: n != null && Number.isNaN(n) ? null : n }));
  }

  setSemestreMax(valor: string | number | null) {
    const n = valor == null || String(valor).trim() === '' ? null : Number(valor);
    this.filtrosDatos.update((f) => ({ ...f, semestreMax: n != null && Number.isNaN(n) ? null : n }));
  }

  umbralInput(campo: CampoMultiSelect): number | null {
    return this.umbralInputs()[campo] ?? null;
  }

  setUmbralInput(campo: CampoMultiSelect, valor: string) {
    const n = valor.trim() === '' ? null : Number(valor);
    this.umbralInputs.update((u) => ({ ...u, [campo]: n != null && Number.isNaN(n) ? null : n }));
  }

  /** Preselecciona, dentro del grupo `campo`, los buckets que califican para el umbral ingresado. */
  aplicarUmbral(grupo: GrupoFiltroDatos, comparador: Comparador) {
    const umbral = this.umbralInput(grupo.campo);
    if (umbral == null) return;
    const buckets = bucketsQueCalifican(grupo.opciones.map((o) => o.value), comparador, umbral);
    this.filtrosDatos.update((f) => ({ ...f, [grupo.campo]: new Set(buckets) }));
  }

  limpiarFiltrosDatos() {
    this.filtrosDatos.set(filtrosVacios());
    this.umbralInputs.set({});
    this.busquedaCarrera.set('');
  }

  async ngOnInit() {
    try {
      const snapshot = await getDocs(collection(this.firestore, 'respuestas'));
      this.respuestas.set(snapshot.docs.map((doc) => doc.data() as RespuestaEncuesta));
    } catch (err) {
      console.error('Error al cargar las respuestas de la encuesta', err);
      this.error.set('No se pudieron cargar los resultados. Inténtalo de nuevo más tarde.');
    } finally {
      this.cargando.set(false);
    }
  }
}