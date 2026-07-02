import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
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

interface Tarjeta {
  titulo: string;
  tipo: 'pie' | 'bar';
  data: ChartData<any, number[], string>;
  options: ChartOptions<any>;
  alto: number;
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
  imports: [CommonModule, BaseChartDirective],
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

  private tarjetaPastel(titulo: string, campo: keyof RespuestaEncuesta, opciones: (Opcion | OpcionEtiquetada)[]): Tarjeta {
    const { labels, valores } = contarOpciones(this.respuestas(), campo, opciones);
    return { titulo, tipo: 'pie', data: this.pieData(labels, valores), options: this.pieOptions, alto: 280 };
  }

  private tarjetaBarras(titulo: string, campo: keyof RespuestaEncuesta, opciones: (Opcion | OpcionEtiquetada)[]): Tarjeta {
    const { labels, valores } = contarOpciones(this.respuestas(), campo, opciones);
    return { titulo, tipo: 'bar', data: this.barData(labels, valores), options: this.barOptions, alto: this.alto(labels.length) };
  }

  private tarjetaBarrasDesde(titulo: string, labels: string[], valores: number[]): Tarjeta {
    return { titulo, tipo: 'bar', data: this.barData(labels, valores), options: this.barOptions, alto: this.alto(labels.length) };
  }

  secciones = computed<Seccion[]>(() => {
    const r = this.respuestas();
    if (r.length === 0) return [];

    return [
      {
        titulo: 'Información general',
        tarjetas: [
          this.tarjetaPastel('1. Edad', 'edad', EDAD_OPCIONES),
          this.tarjetaPastel('2. Género', 'genero', GENERO_OPCIONES),
          this.tarjetaPastel('5. Situación actual', 'situacionSeleccionada', SITUACION_OPCIONES),
          this.tarjetaBarras('4. Semestre actual', 'semestre', SEMESTRE_OPCIONES),
          ((): Tarjeta => {
            const { labels, valores } = contarCarreras(r);
            return this.tarjetaBarrasDesde('3. Carrera universitaria', labels, valores);
          })(),
        ],
      },
      {
        titulo: 'Distribución del tiempo',
        tarjetas: [
          this.tarjetaBarras('6. Horas de estudio al día', 'horasEstudio', HORAS_ESTUDIO_OPCIONES),
          this.tarjetaBarras('7. Horas de trabajo al día', 'horasTrabajo', HORAS_TRABAJO_OPCIONES),
          this.tarjetaBarras('8. Horas de ocio al día', 'horasOcio', HORAS_OCIO_OPCIONES),
          this.tarjetaBarras('9. Horas de sueño al día', 'horasSueno', HORAS_SUENO_OPCIONES),
        ],
      },
      {
        titulo: 'Uso de herramientas de IA',
        tarjetas: [
          this.tarjetaPastel('10. ¿Utiliza IA para actividades académicas?', 'utilizaIa', UTILIZA_IA_OPCIONES),
          this.tarjetaBarras('11. Frecuencia de uso de IA', 'frecuenciaIa', FRECUENCIA_IA_OPCIONES),
          this.tarjetaBarras('14. La IA ayuda a ahorrar tiempo académico', 'ahorroTiempo', LIKERT_OPCIONES),
          ((): Tarjeta => {
            const { labels, valores } = contarCheckboxGroup(r, 'herramientas', HERRAMIENTAS_LABELS, 'isOtraHerramienta');
            return this.tarjetaBarrasDesde('12. Herramientas de IA utilizadas', labels, valores);
          })(),
          ((): Tarjeta => {
            const { labels, valores } = contarCheckboxGroup(r, 'propositos', PROPOSITOS_LABELS, 'isOtroProposito');
            return this.tarjetaBarrasDesde('13. Propósitos de uso de IA', labels, valores);
          })(),
        ],
      },
      {
        titulo: 'Desgaste académico',
        tarjetas: [
          this.tarjetaBarras('15. Frecuencia de agotamiento académico', 'agotamiento', AGOTAMIENTO_OPCIONES),
          this.tarjetaBarras('16. La carga académica afecta la salud emocional', 'saludEmocional', LIKERT_OPCIONES),
          this.tarjetaBarras('17. La IA reduce el estrés académico', 'estresIa', LIKERT_OPCIONES),
          this.tarjetaBarras('18. La IA ayuda a comprender mejor los temas', 'comprensionIa', COMPRENSION_IA_OPCIONES),
          this.tarjetaPastel('19. ¿El uso excesivo de IA genera dependencia?', 'dependencia', DEPENDENCIA_OPCIONES),
        ],
      },
      {
        titulo: 'Análisis comparativo',
        tarjetas: [
          this.tarjetaBarras('20. Área académica con más uso de IA', 'areaSeleccionada', AREA_OPCIONES),
          this.tarjetaBarras('21. La IA mejora la productividad académica', 'productividad', LIKERT_OPCIONES),
          this.tarjetaPastel('22. ¿Las universidades deberían integrar IA oficialmente?', 'integrarIa', INTEGRAR_IA_OPCIONES),
          this.tarjetaBarras('23. Aspecto más positivo del uso de IA', 'aspectoPositivoSeleccionado', ASPECTO_POSITIVO_OPCIONES),
          this.tarjetaBarras('24. Aspecto más negativo del uso de IA', 'aspectoNegativoSeleccionado', ASPECTO_NEGATIVO_OPCIONES),
        ],
      },
    ];
  });

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
