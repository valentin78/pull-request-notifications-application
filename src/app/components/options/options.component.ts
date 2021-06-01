import {Component, OnInit} from '@angular/core';
import {ExtensionSettings} from '../../models/models';
import {DataService} from '../../services/data.service';
import {Router} from '@angular/router';
import {BitbucketService} from '../../services/bitbucket.service';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {

  settings: ExtensionSettings;
  statusMessage?: string;

  constructor(private settingsService: DataService, private bitbucketService: BitbucketService, private router: Router) {
    this.settings = settingsService.getExtensionSettings();
  }

  ngOnInit(): void {
  }

  onSave() {
    this.statusMessage = 'saving...';
    this.bitbucketService
      .validateCredentials(this.settings.bitbucket.url, this.settings.bitbucket.token, this.settings.bitbucket.username)
      .pipe(catchError((error, _) => {
        this.statusMessage = 'wrong credentials';
        return throwError(error);
      }))
      .subscribe(user => {
        this.settingsService.saveExtensionSettings(this.settings);
        this.statusMessage = 'saved!';
        setTimeout(() => {
          this.statusMessage = undefined;
          // this.router.navigate(['']);
        }, 1000);
      });
  }
}

