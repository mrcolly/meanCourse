import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthData} from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private isAuthenticated = false;
  private userId: string;
  private token: string;
  private tokenTimer: any;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient, private router: Router ) {}

  createUser(email: string, password: string) {
    const auth: AuthData = {
      email: email,
      password: password
    }
    this.http.post('http://localhost:3000/api/users/signup', auth)
      .subscribe(response => {
        this.router.navigate(['/']);
      }, error => {
        console.log(error);
      });
  }

  login(email: string, password: string ){
    const auth: AuthData = {
      email: email,
      password: password
    }
    this.http.post<{token: string, expiresIn: number, userId: string}>('http://localhost:3000/api/users/login', auth)
    .subscribe(response => {
      const token = response.token;
      this.token = token;
      if(token){
        const expiresInDuration = response.expiresIn;
        this.setAuthTimer(expiresInDuration)
        const expirationDate = new Date(new Date().getTime() + expiresInDuration * 1000);
        this.saveAuthData(token, expirationDate, this.userId);
        this.isAuthenticated = true;
        this.userId = response.userId;
        this.authStatusListener.next(this.isAuthenticated);
        this.router.navigate(['/']);
      }
    });
  }

  getToken(){
    return this.token;
  }

  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }

  getIsAuth(){
    return this.isAuthenticated;
  }

  getUserId(){
    return this.userId;
  }

  autoAuthUser(){
    const info = this.getAuthData();
    if(!info){
      return;
    }
    const expiresIn = (info.expirationDate.getTime() - new Date().getTime()) / 1000;
    if(expiresIn > 0){
      this.token = info.token;
      this.isAuthenticated= true;
      this.userId = info.userId;
      this.setAuthTimer(expiresIn);
      this.authStatusListener.next(this.isAuthenticated);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.userId = null;
    this.authStatusListener.next(this.isAuthenticated);
    this.clearAuthData();
    clearTimeout(this.tokenTimer);
    this.router.navigate(['/']);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string){
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData(){
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('userId');
  }

  private getAuthData(){
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expirationDate');
    const userId = localStorage.getItem('userId');
    if(!token || !expirationDate || userId){
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }

  private setAuthTimer(duration: number){
    console.log('setting timer '+ duration)
    this.tokenTimer = setTimeout(() => {
      this.logout
    }, duration*1000);
  }
}
