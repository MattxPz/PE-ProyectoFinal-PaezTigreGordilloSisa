import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppFooter } from './components/app-footer/app-footer';
import { AppHeader } from './components/app-header/app-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader, AppFooter],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ProyectoProbabilidad');
}
