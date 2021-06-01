import {Component, OnInit} from '@angular/core';
import {BackgroundService} from '../../services/background.service';

@Component({
  selector: 'app-background-service',
  templateUrl: './background-service.component.html',
  styleUrls: ['./background-service.component.css']
})
export class BackgroundServiceComponent implements OnInit {

  constructor(private service: BackgroundService) {
  }

  ngOnInit(): void {
    this.service.setupWorker();
  }

}
