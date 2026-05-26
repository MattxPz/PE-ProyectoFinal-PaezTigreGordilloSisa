import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {

  filtroPastel: string = 'General';
  filtroBarras: string = 'General';
  filtroTendencia: string = 'General'; // Nuevo filtro
  filtroMapaCalor: string = 'General';

  setFiltro(seccion: 'pastel' | 'barras' | 'tendencia' | 'mapaCalor', valor: string) {
    if (seccion === 'pastel') this.filtroPastel = valor;
    if (seccion === 'barras') this.filtroBarras = valor;
    if (seccion === 'tendencia') this.filtroTendencia = valor;
    if (seccion === 'mapaCalor') this.filtroMapaCalor = valor;
  }

}
