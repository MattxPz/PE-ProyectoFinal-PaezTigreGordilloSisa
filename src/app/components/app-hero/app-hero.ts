import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './app-hero.html',
  styleUrl: './app-hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHero {

  // Inyectamos el router de Angular
  private router = inject(Router);

  // Método que se ejecuta al hacer clic en el botón
  irAEncuesta() {
    this.router.navigate(['/survey']);
  }

}
