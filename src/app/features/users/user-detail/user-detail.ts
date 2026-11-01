import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { User } from '@core/models/user.model';
import { Toggle } from '@shared/directives/toggle';
import { InitialsPipe } from '@shared/pipes/initials-pipe';

/**
 * CHILD component: shows one user's details.
 * It does not fetch anything; it only displays the user the PARENT gives it.
 */
@Component({
  selector: 'app-user-detail',
  // Built-in pipes come from @angular/common and must be imported like components.
  // (The `number` pipe's class is called DecimalPipe.)
  // Custom pipes and directives are imported exactly the same way.
  imports: [UpperCasePipe, DatePipe, DecimalPipe, InitialsPipe, Toggle],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail {
  // input() declares a value the parent passes in: <app-user-detail [user]="..." />
  // .required means the parent MUST provide it (a compile error otherwise).
  // It is a signal, so read it with user().
  readonly user = input.required<User>();

  // A date to format with the date pipe. computed() re-runs whenever user() changes,
  // so this is "the moment this user was opened".
  protected readonly openedAt = computed(() => {
    this.user();
    return new Date();
  });
}
