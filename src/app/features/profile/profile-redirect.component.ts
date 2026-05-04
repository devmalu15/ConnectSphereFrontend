import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../core/services/api.services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-redirect',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="redirect-container">
      <div class="spinner"></div>
      <p>LOCATING USER...</p>
    </div>
  `,
  styles: [`
    .redirect-container { 
      height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;
      background: var(--bg); color: var(--text); font-family: 'JetBrains Mono', monospace; font-weight: 800; letter-spacing: 0.2em;
    }
  `]
})
export class ProfileRedirectComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) {}

  ngOnInit() {
    const username = this.route.snapshot.paramMap.get('username');
    if (username) {
      this.userService.getByUsername(username).subscribe({
        next: res => {
          this.router.navigate(['/profile', res.data.userId], { replaceUrl: true });
        },
        error: () => {
          this.router.navigate(['/feed'], { replaceUrl: true });
        }
      });
    } else {
      this.router.navigate(['/feed'], { replaceUrl: true });
    }
  }
}
