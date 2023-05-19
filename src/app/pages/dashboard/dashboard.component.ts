import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {User} from "../../types/definitions";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: User|undefined
  constructor(public auth: AuthService) {
  }

  ngOnInit(): void {
    this.auth.GetUser.subscribe(res => this.user = res);
  }

}
