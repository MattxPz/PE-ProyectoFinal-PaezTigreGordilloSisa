export type HerramientaKey =
  | 'chatgpt' | 'gemini' | 'claude' | 'copilot' | 'midjourney'
  | 'canva' | 'notion' | 'deepseek' | 'suno' | 'gamma';

export type PropositoKey =
  | 'resumenes' | 'investigacion' | 'programacion' | 'texto' | 'presentaciones'
  | 'imagenes' | 'musica' | 'tareas' | 'explicacion' | 'traduccion';

export interface RespuestaEncuesta {
  edad: string;
  genero: string;
  carrera: string;
  semestre: string;
  situacionSeleccionada: string;

  horasEstudio: string;
  horasTrabajo: string;
  horasOcio: string;
  horasSueno: string;

  utilizaIa: string;
  frecuenciaIa: string;
  ahorroTiempo: string;

  herramientas: Record<HerramientaKey, boolean>;
  isOtraHerramienta: boolean;

  propositos: Record<PropositoKey, boolean>;
  isOtroProposito: boolean;

  agotamiento: string;
  saludEmocional: string;
  estresIa: string;
  comprensionIa: string;
  dependencia: string;

  areaSeleccionada: string;
  productividad: string;
  integrarIa: string;
  aspectoPositivoSeleccionado: string;
  aspectoNegativoSeleccionado: string;

  experienciaAbierta: string;
}

/** Una opción cuyo valor guardado coincide con el texto a mostrar. */
export type Opcion = string;
/** Una opción cuyo valor guardado difiere del texto a mostrar (ej. "1" -> "1er ciclo"). */
export interface OpcionEtiquetada { value: string; label: string; }

export const EDAD_OPCIONES: Opcion[] = ['Menor de 18 años', '18-20 años', '21-23 años', '24-26 años', 'Mayor de 26 años'];
export const GENERO_OPCIONES: Opcion[] = ['Masculino', 'Femenino', 'Prefiero no responder'];

export const SEMESTRE_OPCIONES: OpcionEtiquetada[] = [
  { value: '1', label: '1er ciclo' },
  { value: '2', label: '2do ciclo' },
  { value: '3', label: '3er ciclo' },
  { value: '4', label: '4to ciclo' },
  { value: '5', label: '5to ciclo' },
  { value: '6', label: '6to ciclo' },
  { value: '7', label: '7mo ciclo' },
  { value: '8', label: '8vo ciclo' },
  { value: '9', label: '9no ciclo' },
  { value: '10', label: '10mo ciclo' },
];

export const SITUACION_OPCIONES: Opcion[] = ['Solo estudio', 'Estudio y trabajo', 'Solo trabajo', 'Otra'];

export const HORAS_ESTUDIO_OPCIONES: Opcion[] = ['Menos de 1 hora', '1-2 horas', '3-4 horas', '5-6 horas', 'Más de 6 horas'];
export const HORAS_TRABAJO_OPCIONES: Opcion[] = ['No trabajo', '1-3 horas', '4-6 horas', '7-8 horas', 'Más de 8 horas'];
export const HORAS_OCIO_OPCIONES: Opcion[] = ['Menos de 1 hora', '1-2 horas', '3-4 horas', 'Más de 4 horas'];
export const HORAS_SUENO_OPCIONES: Opcion[] = ['Menos de 4 horas', '4-5 horas', '6-7 horas', '8 horas o más'];

export const UTILIZA_IA_OPCIONES: Opcion[] = ['Sí', 'No'];
export const FRECUENCIA_IA_OPCIONES: Opcion[] = ['Nunca', 'Rara vez', 'Algunas veces por semana', 'Casi todos los días', 'Todos los días'];

export const LIKERT_OPCIONES: OpcionEtiquetada[] = [
  { value: '1', label: 'Totalmente en desacuerdo' },
  { value: '2', label: 'En desacuerdo' },
  { value: '3', label: 'Neutral' },
  { value: '4', label: 'De acuerdo' },
  { value: '5', label: 'Totalmente de acuerdo' },
];

export const HERRAMIENTAS_LABELS: { key: HerramientaKey; label: string }[] = [
  { key: 'chatgpt', label: 'ChatGPT' },
  { key: 'gemini', label: 'Gemini' },
  { key: 'claude', label: 'Claude' },
  { key: 'copilot', label: 'Copilot' },
  { key: 'midjourney', label: 'MidJourney' },
  { key: 'canva', label: 'Canva AI' },
  { key: 'notion', label: 'Notion AI' },
  { key: 'deepseek', label: 'DeepSeek' },
  { key: 'suno', label: 'Suno AI' },
  { key: 'gamma', label: 'Gamma AI' },
];

export const PROPOSITOS_LABELS: { key: PropositoKey; label: string }[] = [
  { key: 'resumenes', label: 'Resúmenes' },
  { key: 'investigacion', label: 'Investigación' },
  { key: 'programacion', label: 'Programación' },
  { key: 'texto', label: 'Generación de texto' },
  { key: 'presentaciones', label: 'Presentaciones' },
  { key: 'imagenes', label: 'Generación de imágenes' },
  { key: 'musica', label: 'Música' },
  { key: 'tareas', label: 'Resolución de tareas' },
  { key: 'explicacion', label: 'Explicación de temas' },
  { key: 'traduccion', label: 'Traducción' },
];

export const AGOTAMIENTO_OPCIONES: Opcion[] = ['Nunca', 'Rara vez', 'Algunas veces', 'Frecuentemente', 'Siempre'];
export const COMPRENSION_IA_OPCIONES: Opcion[] = ['Nunca', 'Rara vez', 'Algunas veces', 'Frecuentemente', 'Siempre'];
export const DEPENDENCIA_OPCIONES: Opcion[] = ['Sí', 'No', 'Tal vez'];

export const AREA_OPCIONES: OpcionEtiquetada[] = [
  { value: 'Ingenierias', label: 'Ingenierías' },
  { value: 'Diseno y Multimedia', label: 'Diseño y Multimedia' },
  { value: 'Ciencias Sociales', label: 'Ciencias Sociales' },
  { value: 'Medicina', label: 'Medicina' },
  { value: 'Administracion', label: 'Administración' },
  { value: 'Arquitectura', label: 'Arquitectura' },
  { value: 'Otra', label: 'Otra' },
];

export const INTEGRAR_IA_OPCIONES: Opcion[] = ['Sí', 'No', 'Parcialmente'];

export const ASPECTO_POSITIVO_OPCIONES: Opcion[] = [
  'Ahorro de tiempo', 'Mayor comprensión', 'Automatización de tareas',
  'Creatividad', 'Apoyo en programación', 'Generación rápida de contenido', 'Otra',
];

export const ASPECTO_NEGATIVO_OPCIONES: Opcion[] = [
  'Dependencia', 'Menor razonamiento', 'Información incorrecta',
  'Plagio académico', 'Menor esfuerzo personal', 'Distracción', 'Otra',
];

/** Paleta categórica validada (orden fijo, nunca se reordena por gráfico). */
export const COLORES_CATEGORICOS = ['#007bff', '#10b981', '#f59e0b', '#16a34a', '#7c3aed', '#ef4444', '#db2777', '#ea580c'];
export const COLOR_BARRA = '#007bff';