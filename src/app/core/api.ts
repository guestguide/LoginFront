import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class ApiService {
  users = signal<any[] | null>(null);
  loading = signal(false);

  constructor(private http: HttpClient) {}

  fetchUsers() {
    this.loading.set(true);
    this.http.get<any[]>(`${environment.apiBaseUrl}/users`).subscribe({
      next: data => { this.users.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
