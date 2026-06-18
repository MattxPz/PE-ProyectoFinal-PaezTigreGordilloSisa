import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './survey.html',
  styleUrls: ['./survey.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Survey {

  private router = inject(Router);

  currentSection: number = 0;
  showValidationError: boolean = false;
  
  email: string = '';
  emailError: boolean = false;

  edad: string = '';
  genero: string = '';
  carrera: string = '';
  semestre: string = '';
  situacionSeleccionada: string = '';
  otraSituacionTexto: string = '';

  horasEstudio: string = '';
  horasTrabajo: string = '';
  horasOcio: string = '';
  horasSueno: string = '';

  utilizaIa: string = '';
  frecuenciaIa: string = '';
  ahorroTiempo: string = '';

  herramientas = { chatgpt: false, gemini: false, claude: false, copilot: false, midjourney: false, canva: false, notion: false, deepseek: false, suno: false, gamma: false };
  isOtraHerramienta: boolean = false;
  otraHerramientaTexto: string = '';

  propositos = { resumenes: false, investigacion: false, programacion: false, texto: false, presentaciones: false, imagenes: false, musica: false, tareas: false, explicacion: false, traduccion: false };
  isOtroProposito: boolean = false;
  otroPropositoTexto: string = '';

  agotamiento: string = '';
  saludEmocional: string = '';
  estresIa: string = '';
  comprensionIa: string = '';
  dependencia: string = '';

  areaSeleccionada: string = '';
  otraAreaTexto: string = '';
  productividad: string = '';
  integrarIa: string = '';
  aspectoPositivoSeleccionado: string = '';
  otroAspectoPositivoTexto: string = '';
  aspectoNegativoSeleccionado: string = '';
  otroAspectoNegativoTexto: string = '';

  experienciaAbierta: string = '';

  get hasHerramientas(): boolean {
    return Object.values(this.herramientas).some(v => v) || (this.isOtraHerramienta && this.otraHerramientaTexto.trim() !== '');
  }

  get hasPropositos(): boolean {
    return Object.values(this.propositos).some(v => v) || (this.isOtroProposito && this.otroPropositoTexto.trim() !== '');
  }

  nextSection() {
    this.showValidationError = false;

    if (this.currentSection === 0) {
      if (!this.email.trim().toLowerCase().endsWith('@est.ups.edu.ec')) {
        this.emailError = true;
        return;
      }
      this.emailError = false;
    } else if (this.currentSection === 1) {
      if (!this.edad || !this.genero || !this.carrera.trim() || !this.semestre || !this.situacionSeleccionada || (this.situacionSeleccionada === 'Otra' && !this.otraSituacionTexto.trim())) {
        this.showValidationError = true;
        return;
      }
    } else if (this.currentSection === 2) {
      if (!this.horasEstudio || !this.horasTrabajo || !this.horasOcio || !this.horasSueno) {
        this.showValidationError = true;
        return;
      }
    } else if (this.currentSection === 3) {
      if (!this.utilizaIa || !this.frecuenciaIa || !this.ahorroTiempo || !this.hasHerramientas || !this.hasPropositos) {
        this.showValidationError = true;
        return;
      }
    } else if (this.currentSection === 4) {
      if (!this.agotamiento || !this.saludEmocional || !this.estresIa || !this.comprensionIa || !this.dependencia) {
        this.showValidationError = true;
        return;
      }
    } else if (this.currentSection === 5) {
      if (!this.areaSeleccionada || (this.areaSeleccionada === 'Otra' && !this.otraAreaTexto.trim()) || !this.productividad || !this.integrarIa || !this.aspectoPositivoSeleccionado || (this.aspectoPositivoSeleccionado === 'Otra' && !this.otroAspectoPositivoTexto.trim()) || !this.aspectoNegativoSeleccionado || (this.aspectoNegativoSeleccionado === 'Otra' && !this.otroAspectoNegativoTexto.trim())) {
        this.showValidationError = true;
        return;
      }
    }

    if (this.currentSection < 6) {
      this.currentSection++;
      window.scrollTo(0, 0);
    }
  }

  prevSection() {
    this.showValidationError = false;
    if (this.currentSection > 0) {
      this.currentSection--;
      window.scrollTo(0, 0);
    }
  }

  onSituacionChange() {
    if (this.situacionSeleccionada !== 'Otra') {
      this.otraSituacionTexto = '';
    }
  }

  onOtraHerramientaChange() {
    if (!this.isOtraHerramienta) {
      this.otraHerramientaTexto = '';
    }
  }

  onOtroPropositoChange() {
    if (!this.isOtroProposito) {
      this.otroPropositoTexto = '';
    }
  }

  onAreaChange() {
    if (this.areaSeleccionada !== 'Otra') {
      this.otraAreaTexto = '';
    }
  }

  onAspectoPositivoChange() {
    if (this.aspectoPositivoSeleccionado !== 'Otra') {
      this.otroAspectoPositivoTexto = '';
    }
  }

  onAspectoNegativoChange() {
    if (this.aspectoNegativoSeleccionado !== 'Otra') {
      this.otroAspectoNegativoTexto = '';
    }
  }

  submitSurvey() {
    this.showValidationError = false;
    if (!this.experienciaAbierta.trim()) {
      this.showValidationError = true;
      return;
    }
    this.router.navigate(['/dashboard']);
  }
}