import { Routes } from '@angular/router';
import {HomeComponent} from '../home/home.component';
import {OptionsComponent} from '../options/options.component';

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
