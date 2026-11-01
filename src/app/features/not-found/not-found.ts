import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Shown for any URL that matches no route (the '**' wildcard). */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <h1>404 - Page not found</h1>
    <p>The page you are looking for does not exist.</p>
    <a routerLink="/">Go to Home</a>
  `,
})
export class NotFound {}
