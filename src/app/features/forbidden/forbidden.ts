import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** 403: logged in, but the user's role is not allowed on that page (see roleGuard). */
@Component({
  selector: 'app-forbidden',
  imports: [RouterLink],
  template: `
    <h1>403 - Access denied</h1>
    <p>You do not have permission to view this page.</p>
    <a routerLink="/">Go to Home</a>
  `,
})
export class Forbidden {}
