import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-detail-livre',
  imports: [HeaderComponent, SidebarComponent],
  templateUrl: './detail-livre.component.html',
  styleUrl: './detail-livre.component.css'
})
export class DetailLivreComponent {

}
