import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OptionsComponent } from './components/options/options.component';
import { HomeComponent } from './components/home/home.component';
import { BackgroundPageComponent } from './components/background-page/background-page.component';
const routes = [
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
let AppRoutingModule = class AppRoutingModule {
};
AppRoutingModule = __decorate([
    NgModule({
        imports: [RouterModule.forRoot(routes, {
                useHash: true
            })],
        exports: [RouterModule]
    })
], AppRoutingModule);
export { AppRoutingModule };
//# sourceMappingURL=app-routing.module.js.map