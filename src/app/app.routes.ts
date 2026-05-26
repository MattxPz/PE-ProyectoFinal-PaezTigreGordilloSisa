import { Routes } from '@angular/router';
import { AppHero } from './components/app-hero/app-hero';
import { Dashboard } from './components/dashboard/dashboard';
import { Survey } from './components/survey/survey';

export const routes: Routes = [
    {path: '', component: AppHero},
    {path: 'dashboard', component: Dashboard},
    {path: 'survey', component: Survey},
    {path: '**', redirectTo: ''}
];
