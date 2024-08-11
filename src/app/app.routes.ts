import { Routes } from '@angular/router';
import {HomeComponent} from '../components/home/home.component';
import {OptionsComponent} from '../components/options/options.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: "full"
  },
  {
    path: 'options',
    component: OptionsComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
