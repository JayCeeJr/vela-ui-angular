import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {User} from "../../types/definitions";
import {ApiService} from "../../services/api.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: User|undefined
  constructor(public auth: AuthService, private api: ApiService) {
  }

  ngOnInit(): void {
    this.auth.GetUser.subscribe(res => this.user = res);
  }

  public getRepos() {
    this.api.getRepos().subscribe(res => console.log(res));
  }

}
