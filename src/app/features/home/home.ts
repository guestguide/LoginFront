import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  username = '';

  ngOnInit(): void {
    const name = this.getUsernameFromToken();
    this.username = name ?? '';
  }

  private getUsernameFromToken(): string | null {
    const token = localStorage.getItem('auth.token');
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
      const payload = JSON.parse(atob(parts[1]));
      return (
        payload?.unique_name || null
      );
    } catch {
      return null;
    }
  }
}