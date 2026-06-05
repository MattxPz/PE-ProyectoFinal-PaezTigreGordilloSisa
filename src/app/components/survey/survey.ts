import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './survey.html',
  styleUrls: ['./survey.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Survey {

  private router = inject(Router);

  // Variables conectadas al HTML mediante Angular
  situacionSeleccionada: string = '';
  otraSituacionTexto: string = '';

  // Método para limpiar el texto si el usuario se arrepiente y elige otra opción
  onSituacionChange() {
    if (this.situacionSeleccionada !== 'Otra') {
      this.otraSituacionTexto = '';
    }
  }

  submitSurvey() {
    // Aquí a futuro irá la lógica para guardar las respuestas
    console.log('Encuesta enviada, redirigiendo...');
    this.router.navigate(['/dashboard']);
  }

  // Variables para la Pregunta 12 (Herramientas IA)
  isOtraHerramienta: boolean = false;
  otraHerramientaTexto: string = '';

  onOtraHerramientaChange() {
    // Si el usuario desmarca la casilla, limpiamos el texto
    if (!this.isOtraHerramienta) {
      this.otraHerramientaTexto = '';
    }
  }

  // Variables para la Pregunta 13 (Propósitos IA)
  isOtroProposito: boolean = false;
  otroPropositoTexto: string = '';

  onOtroPropositoChange() {
    // Si el usuario desmarca la casilla, limpiamos el texto
    if (!this.isOtroProposito) {
      this.otroPropositoTexto = '';
    }
  }
}