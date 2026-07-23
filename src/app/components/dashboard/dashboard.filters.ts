import {
  AGOTAMIENTO_OPCIONES, AREA_OPCIONES, ASPECTO_NEGATIVO_OPCIONES, ASPECTO_POSITIVO_OPCIONES,
  CARRERA_OPCIONES, COMPRENSION_IA_OPCIONES, DEPENDENCIA_OPCIONES, EDAD_OPCIONES,
  FRECUENCIA_IA_OPCIONES, GENERO_OPCIONES, HERRAMIENTAS_LABELS, HORAS_ESTUDIO_OPCIONES,
  HORAS_OCIO_OPCIONES, HORAS_SUENO_OPCIONES, HORAS_TRABAJO_OPCIONES, INTEGRAR_IA_OPCIONES,
  LIKERT_OPCIONES, Opcion, OpcionEtiquetada, PROPOSITOS_LABELS, RespuestaEncuesta,
  SITUACION_OPCIONES, UTILIZA_IA_OPCIONES,
} from './dashboard.constants';

/**
 * Filtro de segmentación de datos: decide qué respuestas (estudiantes) entran en los
 * conteos del dashboard. Es independiente del filtro de visibilidad de preguntas
 * (`seleccionadas`/`busqueda` en dashboard.ts), que solo decide qué tarjetas se muestran.
 */
export interface FiltrosDatos {
  edad: Set<string>;
  genero: Set<string>;
  carrera: Set<string>;
  areaSeleccionada: Set<string>;
  semestreMin: number | null;
  semestreMax: number | null;
  situacionSeleccionada: Set<string>;
  horasEstudio: Set<string>;
  horasTrabajo: Set<string>;
  horasOcio: Set<string>;
  horasSueno: Set<string>;
  utilizaIa: Set<string>;
  frecuenciaIa: Set<string>;
  dependencia: Set<string>;
  integrarIa: Set<string>;
  herramientas: Set<string>;
  propositos: Set<string>;
  ahorroTiempo: Set<string>;
  saludEmocional: Set<string>;
  estresIa: Set<string>;
  productividad: Set<string>;
  comprensionIa: Set<string>;
  agotamiento: Set<string>;
  aspectoPositivoSeleccionado: Set<string>;
  aspectoNegativoSeleccionado: Set<string>;
}

/** Campos de `FiltrosDatos` que son multi-select (todos salvo el rango de semestre). */
export type CampoMultiSelect = Exclude<keyof FiltrosDatos, 'semestreMin' | 'semestreMax'>;

const CAMPOS_MULTISELECT: CampoMultiSelect[] = [
  'edad', 'genero', 'carrera', 'areaSeleccionada', 'situacionSeleccionada',
  'horasEstudio', 'horasTrabajo', 'horasOcio', 'horasSueno',
  'utilizaIa', 'frecuenciaIa', 'dependencia', 'integrarIa',
  'herramientas', 'propositos',
  'ahorroTiempo', 'saludEmocional', 'estresIa', 'productividad',
  'comprensionIa', 'agotamiento', 'aspectoPositivoSeleccionado', 'aspectoNegativoSeleccionado',
];

export function filtrosVacios(): FiltrosDatos {
  const vacio = {} as FiltrosDatos;
  for (const campo of CAMPOS_MULTISELECT) (vacio[campo] as Set<string>) = new Set();
  vacio.semestreMin = null;
  vacio.semestreMax = null;
  return vacio;
}

export function hayFiltrosActivos(f: FiltrosDatos): boolean {
  if (f.semestreMin != null || f.semestreMax != null) return true;
  return CAMPOS_MULTISELECT.some((campo) => (f[campo] as Set<string>).size > 0);
}

function esOpcionEtiquetada(o: Opcion | OpcionEtiquetada): o is OpcionEtiquetada {
  return typeof o !== 'string';
}

export function opcionesComoLista(opciones: (Opcion | OpcionEtiquetada)[]): { value: string; label: string }[] {
  return opciones.map((o) => (esOpcionEtiquetada(o) ? { value: o.value, label: o.label } : { value: o, label: o }));
}

/** Descripción de un grupo de filtro de datos para renderizar el panel de segmentación. */
export interface GrupoFiltroDatos {
  campo: CampoMultiSelect;
  titulo: string;
  opciones: { value: string; label: string }[];
  /** Este grupo tiene un buscador de texto encima de sus chips (usado por "carrera", ~45 opciones). */
  buscador?: boolean;
  /** Este grupo acepta un umbral rápido de "menor/mayor a N horas" que preselecciona buckets. */
  umbral?: boolean;
}

export const GRUPOS_FILTRO_DATOS: GrupoFiltroDatos[] = [
  { campo: 'edad', titulo: 'Edad de los estudiantes encuestados', opciones: opcionesComoLista(EDAD_OPCIONES) },
  { campo: 'genero', titulo: 'Género de los estudiantes encuestados', opciones: opcionesComoLista(GENERO_OPCIONES) },
  { campo: 'carrera', titulo: 'Carrera universitaria de los estudiantes encuestados', opciones: opcionesComoLista(CARRERA_OPCIONES), buscador: true },
  { campo: 'areaSeleccionada', titulo: 'Área académica de los estudiantes encuestados', opciones: opcionesComoLista(AREA_OPCIONES) },
  { campo: 'situacionSeleccionada', titulo: 'Situación actual de los estudiantes encuestados', opciones: opcionesComoLista(SITUACION_OPCIONES) },
  { campo: 'horasEstudio', titulo: 'Horas al día que los estudiantes dedican a estudiar', opciones: opcionesComoLista(HORAS_ESTUDIO_OPCIONES), umbral: true },
  { campo: 'horasTrabajo', titulo: 'Horas al día que los estudiantes dedican a trabajar', opciones: opcionesComoLista(HORAS_TRABAJO_OPCIONES), umbral: true },
  { campo: 'horasOcio', titulo: 'Horas al día que los estudiantes dedican al ocio', opciones: opcionesComoLista(HORAS_OCIO_OPCIONES), umbral: true },
  { campo: 'horasSueno', titulo: 'Horas al día que los estudiantes duermen', opciones: opcionesComoLista(HORAS_SUENO_OPCIONES), umbral: true },
  { campo: 'utilizaIa', titulo: '¿Los estudiantes usan IA para sus actividades académicas?', opciones: opcionesComoLista(UTILIZA_IA_OPCIONES) },
  { campo: 'frecuenciaIa', titulo: 'Con qué frecuencia usan IA los estudiantes', opciones: opcionesComoLista(FRECUENCIA_IA_OPCIONES) },
  { campo: 'dependencia', titulo: '¿Los estudiantes creen que el uso excesivo de IA genera dependencia?', opciones: opcionesComoLista(DEPENDENCIA_OPCIONES) },
  { campo: 'integrarIa', titulo: '¿Los estudiantes creen que las universidades deberían integrar IA oficialmente?', opciones: opcionesComoLista(INTEGRAR_IA_OPCIONES) },
  { campo: 'herramientas', titulo: 'Herramientas de IA que utilizan los estudiantes', opciones: HERRAMIENTAS_LABELS.map((e) => ({ value: e.key, label: e.label })) },
  { campo: 'propositos', titulo: 'Para qué usan la IA los estudiantes', opciones: PROPOSITOS_LABELS.map((e) => ({ value: e.key, label: e.label })) },
  { campo: 'ahorroTiempo', titulo: '¿La IA les ayuda a ahorrar tiempo académico?', opciones: opcionesComoLista(LIKERT_OPCIONES) },
  { campo: 'saludEmocional', titulo: '¿La carga académica afecta su salud emocional?', opciones: opcionesComoLista(LIKERT_OPCIONES) },
  { campo: 'estresIa', titulo: '¿La IA reduce su estrés académico?', opciones: opcionesComoLista(LIKERT_OPCIONES) },
  { campo: 'productividad', titulo: '¿La IA mejora su productividad académica?', opciones: opcionesComoLista(LIKERT_OPCIONES) },
  { campo: 'comprensionIa', titulo: '¿La IA les ayuda a comprender mejor los temas?', opciones: opcionesComoLista(COMPRENSION_IA_OPCIONES) },
  { campo: 'agotamiento', titulo: 'Con qué frecuencia sienten agotamiento académico', opciones: opcionesComoLista(AGOTAMIENTO_OPCIONES) },
  { campo: 'aspectoPositivoSeleccionado', titulo: 'Aspecto más positivo del uso de IA, según los estudiantes', opciones: opcionesComoLista(ASPECTO_POSITIVO_OPCIONES) },
  { campo: 'aspectoNegativoSeleccionado', titulo: 'Aspecto más negativo del uso de IA, según los estudiantes', opciones: opcionesComoLista(ASPECTO_NEGATIVO_OPCIONES) },
];

export type Comparador = 'menorQue' | 'mayorQue';

interface RangoBucket { opcion: string; min: number; max: number; }

/**
 * Extrae el rango numérico [min, max] que representa una opción tipo "3-4 horas",
 * "Menos de 1 hora", "Más de 6 horas" o "8 horas o más". Es una aproximación por
 * texto porque el dato de origen guarda buckets, no horas exactas.
 */
function parsearRangoBucket(opcion: string): RangoBucket {
  const texto = opcion.toLowerCase();
  const numeros = (texto.match(/\d+(\.\d+)?/g) ?? []).map(Number);

  if (/menos de|no trabajo|no estudio/.test(texto)) {
    return { opcion, min: 0, max: numeros[0] ?? 0 };
  }
  if (/más de|mas de|o más|o mas|mayor de/.test(texto)) {
    return { opcion, min: numeros[0] ?? 0, max: Infinity };
  }
  if (numeros.length >= 2) {
    return { opcion, min: numeros[0], max: numeros[1] };
  }
  if (numeros.length === 1) {
    return { opcion, min: numeros[0], max: numeros[0] };
  }
  return { opcion, min: 0, max: Infinity };
}

/**
 * Dado un umbral de horas y una dirección de comparación, devuelve qué buckets de
 * opciones califican.
 *
 * LIMITACIÓN DE DATOS: las opciones son rangos (ej. "3-4 horas"), no valores exactos.
 * Cuando el umbral cae DENTRO de un bucket (ej. umbral=4 y bucket "3-4 horas"), ese
 * bucket se incluye por defecto como mejor aproximación posible — no es un bug, es la
 * limitación del bucketing de origen. Si el criterio de negocio cambia (ej. excluir
 * siempre el bucket fronterizo), este es el único lugar que hay que tocar.
 */
export function bucketsQueCalifican(opciones: string[], comparador: Comparador, umbral: number): string[] {
  return opciones
    .map(parsearRangoBucket)
    .filter((b) => (comparador === 'menorQue' ? b.min < umbral : b.max > umbral))
    .map((b) => b.opcion);
}

function pasaMultiSelect(valores: Set<string>, valorRespuesta: string | undefined | null): boolean {
  if (valores.size === 0) return true;
  return !!valorRespuesta && valores.has(valorRespuesta);
}

function pasaGrupoBooleano(claves: Set<string>, mapa: Record<string, boolean> | undefined): boolean {
  if (claves.size === 0) return true;
  if (!mapa) return false;
  for (const clave of claves) {
    if (mapa[clave]) return true;
  }
  return false;
}

/**
 * Evalúa si una respuesta cumple todos los filtros activos.
 * Reglas de combinación: OR entre opciones marcadas dentro de un mismo campo,
 * AND entre campos distintos. Un campo sin opciones marcadas no restringe (= "todos").
 */
export function respuestaCumpleFiltros(r: RespuestaEncuesta, f: FiltrosDatos): boolean {
  if (!pasaMultiSelect(f.edad, r.edad)) return false;
  if (!pasaMultiSelect(f.genero, r.genero)) return false;
if (!pasaMultiSelect(f.carrera, r.carrera?.trim().toLowerCase())) return false;
  if (!pasaMultiSelect(f.areaSeleccionada, r.areaSeleccionada)) return false;
  if (!pasaMultiSelect(f.situacionSeleccionada, r.situacionSeleccionada)) return false;
  if (!pasaMultiSelect(f.horasEstudio, r.horasEstudio)) return false;
  if (!pasaMultiSelect(f.horasTrabajo, r.horasTrabajo)) return false;
  if (!pasaMultiSelect(f.horasOcio, r.horasOcio)) return false;
  if (!pasaMultiSelect(f.horasSueno, r.horasSueno)) return false;
  if (!pasaMultiSelect(f.utilizaIa, String(r.utilizaIa))) return false;
  if (!pasaMultiSelect(f.frecuenciaIa, r.frecuenciaIa)) return false;
  if (!pasaMultiSelect(f.dependencia, r.dependencia)) return false;
  if (!pasaMultiSelect(f.integrarIa, r.integrarIa)) return false;
  if (!pasaGrupoBooleano(f.herramientas, r.herramientas as unknown as Record<string, boolean>)) return false;
  if (!pasaGrupoBooleano(f.propositos, r.propositos as unknown as Record<string, boolean>)) return false;
  if (!pasaMultiSelect(f.ahorroTiempo, r.ahorroTiempo)) return false;
  if (!pasaMultiSelect(f.saludEmocional, r.saludEmocional)) return false;
  if (!pasaMultiSelect(f.estresIa, r.estresIa)) return false;
  if (!pasaMultiSelect(f.productividad, r.productividad)) return false;
  if (!pasaMultiSelect(f.comprensionIa, r.comprensionIa)) return false;
  if (!pasaMultiSelect(f.agotamiento, r.agotamiento)) return false;
  if (!pasaMultiSelect(f.aspectoPositivoSeleccionado, r.aspectoPositivoSeleccionado)) return false;
  if (!pasaMultiSelect(f.aspectoNegativoSeleccionado, r.aspectoNegativoSeleccionado)) return false;

  if (f.semestreMin != null && Number(r.semestre) < f.semestreMin) return false;
  if (f.semestreMax != null && Number(r.semestre) > f.semestreMax) return false;

  return true;
}
