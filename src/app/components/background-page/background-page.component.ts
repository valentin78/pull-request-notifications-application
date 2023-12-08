import {Component, OnInit} from '@angular/core';
import {BackgroundService} from '../../services/background.service';

@Component({
    selector: 'app-background-service',
    templateUrl: './background-page.component.html',
    styleUrls: ['./background-page.component.css']
})
export class BackgroundPageComponent implements OnInit {
    constructor(private service: BackgroundService) {
    }

    ngOnInit(): void {
        this.service.setupAlarms();
    }
}
