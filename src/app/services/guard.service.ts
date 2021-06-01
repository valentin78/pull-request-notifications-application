import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {DataService} from './data.service';
import {Observable} from 'rxjs';

@Injectable()
export class Guard implements CanActivate {
  constructor(private dataService: DataService, private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    const settings = this.dataService.getExtensionSettings();
    if (settings?.bitbucket?.isValid) {
      return true;
    }

    this.router.navigate(['options']);
    return false;
  }
}
