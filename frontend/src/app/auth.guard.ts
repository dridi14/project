import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const accessToken = this.authService.getAccessToken();

    if (accessToken) {
      // Access token exists, allow access to the route
      return true;
    } else {
      // Access token does not exist, redirect to the login page
      this.router.navigate(['/login']);
      alert('You are not logged in');
      return false;
    }
  }
}
