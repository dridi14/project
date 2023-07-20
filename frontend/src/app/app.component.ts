import { Component, OnDestroy, OnInit, ChangeDetectorRef  } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'front';
  isLoggedIn = false; // Set to true when the user is logged in
  private subscription: Subscription | undefined;

  constructor(private authService: AuthService, private router: Router,
    private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {}
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  logout(): void {
    // Perform logout actions (e.g., clear tokens, session data, etc.)
    this.authService.removeAccessToken();
    this.router.navigate(['/login']);
    // Optionally, you can clear any other user-related data or perform additional actions
  }

  isLogged(): any {
    return (this.router.url !== '/login');
}
}
