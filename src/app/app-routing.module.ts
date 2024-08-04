import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {OptionsComponent} from './components/options/options.component';
import {HomeComponent} from './components/home/home.component';
import {BackgroundPageComponent} from './components/background-page/background-page.component';

const routes: Routes = [
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
    path: 'background',
    component: BackgroundPageComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
