import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  ArcElement, BarController, BarElement, CategoryScale, Legend,
  LinearScale, PieController, Tooltip,
} from 'chart.js';
import { provideCharts } from 'ng2-charts';

import { routes } from './app.routes';
import { provideFirebaseApp, provideFirestore } from './core/firebase.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideFirebaseApp(),
    provideFirestore(),
    // Solo registramos pastel y barras (los únicos tipos que usa el dashboard)
    // para no cargar el resto de controladores de Chart.js en el bundle.
    provideCharts({
      registerables: [ArcElement, BarController, BarElement, CategoryScale, Legend, LinearScale, PieController, Tooltip],
    }),
  ]
};
