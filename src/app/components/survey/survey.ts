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

  // Método que simula el envío y redirige
  submitSurvey() {
    // Aquí a futuro irá la lógica para guardar las respuestas en tu backend
    console.log('Encuesta enviada, redirigiendo...');
    this.router.navigate(['/dashboard']);
  }

}