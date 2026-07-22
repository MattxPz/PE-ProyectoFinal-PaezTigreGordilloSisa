import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Developer {
  name: string;
  github: string;
}

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './app-footer.html',
  styleUrl: './app-footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFooter {
  developers: Developer[] = [
    { name: 'David Sisa', github: 'https://github.com/Riiiiii1' },
    { name: 'Carlos Gordillo', github: 'https://github.com/antonikr8s' },
    { name: 'John Tigre', github: 'https://github.com/Tigresitop' },
    { name: 'Mateo Paez', github: 'https://github.com/MattxPz' },
  ];
}