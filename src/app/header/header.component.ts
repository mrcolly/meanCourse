import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private authListenerSub: Subscription;

  constructor(private authService : AuthService){}

  ngOnInit(){
    this.isAuthenticated = this.authService.getIsAuth();
    this.authListenerSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated =>{
      this.isAuthenticated = isAuthenticated;
    });
  }

  ngOnDestroy(){
    this.authListenerSub.unsubscribe();
  }

  onLogout(){
    this.authService.logout();
  }

}
