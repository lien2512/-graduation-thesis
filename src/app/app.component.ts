import { Component } from '@angular/core';
import { PresenceService } from './services/presence.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'BeautyGarden';
  constructor(public presence: PresenceService) {}
}
