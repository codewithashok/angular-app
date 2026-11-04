import { DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { User } from '@core/models/user.model';
import { AuthService } from '@core/services/auth.service';
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

  // output() declares an event the PARENT can listen to: <app-user-detail (closed)="..." />
  // <User> is the type of data sent up with the event.
  readonly closed = output<User>();

  close(): void {
    // The child does not hide itself; it just tells the parent "close was clicked for this user".
    this.closed.emit(this.user());
  }

  // A date to format with the date pipe. computed() re-runs whenever user() changes,
  // so this is "the moment this user was opened".
  protected readonly openedAt = computed(() => {
    this.user();
    return new Date();
  });

  // Used by the template to show the phone number to admins only.
  protected readonly auth = inject(AuthService);
}

/*
 * ===========================================================================
 *  NOTES: public / protected / private / readonly
 * ===========================================================================
 *
 * There are TWO separate ideas here:
 *   1. ACCESS MODIFIERS -> WHO can use a member     (public, protected, private, #)
 *   2. readonly         -> can it be REASSIGNED?    (yes / no)
 * They are combined freely, e.g. `protected readonly openedAt`.
 *
 * ---------------------------------------------------------------------------
 *  1. ACCESS MODIFIERS (pick one)
 * ---------------------------------------------------------------------------
 *
 *  Modifier       | This class | Subclass | Its TEMPLATE (.html) | Other code
 *  ---------------|------------|----------|----------------------|-----------
 *  public         |    yes     |   yes    |         yes          |    yes
 *  protected      |    yes     |   yes    |         yes          |    no
 *  private        |    yes     |   no     |         NO           |    no
 *  #name (JS)     |    yes     |   no     |         NO           |    no
 *
 *  - public (the DEFAULT when nothing is written)
 *      Anyone can use it. In Angular: inputs and outputs must be public,
 *      because the PARENT component binds to them:
 *        readonly user = input.required<User>();   // parent: [user]="..."
 *        readonly closed = output<User>();         // parent: (closed)="..."
 *
 *  - protected
 *      Only this class (and subclasses). Angular templates are compiled as part
 *      of the component, so the TEMPLATE can use protected members too.
 *      Best choice for "things my template needs, but nobody else":
 *        protected readonly openedAt = computed(...);   // used in user-detail.html
 *
 *  - private
 *      Only code inside this class. The template CANNOT use it (build error).
 *      Use it for internal helpers and injected services the template doesn't need:
 *        private readonly api = inject(ApiService);   // (see UserList)
 *
 *  - #name (JavaScript private field)
 *      Like private, but enforced at RUNTIME by JavaScript itself.
 *      (TypeScript's `private` only exists at compile time.) Rare in Angular code.
 *
 *  Note: close() has no modifier, so it is public. Since only the template calls
 *  it, `protected close()` would be the stricter choice.
 *
 * ---------------------------------------------------------------------------
 *  2. readonly
 * ---------------------------------------------------------------------------
 *
 *  The PROPERTY cannot be reassigned after the object is created:
 *      this.openedAt = somethingElse;   // compile error
 *
 *  It does NOT freeze the value inside. A readonly signal can still change its
 *  VALUE; you just can't replace the signal itself with a different one:
 *      readonly count = signal(0);
 *      this.count.set(5);          // OK: the value inside changes
 *      this.count = signal(10);    // compile error: the property is readonly
 *
 *  Why use it? input(), output(), computed(), signal() and inject() should be
 *  created once and never replaced. readonly guarantees nobody accidentally does.
 *
 *  Don't confuse with signal.asReadonly() (see AuthService):
 *      readonly          -> the PROPERTY can't be reassigned
 *      .asReadonly()     -> the SIGNAL's value can't be changed (.set() is removed)
 *
 * ---------------------------------------------------------------------------
 *  QUICK RULES used in this project
 * ---------------------------------------------------------------------------
 *      input() / output()                   -> readonly            (public)
 *      used only by this component's HTML   -> protected readonly
 *      injected services, internal state    -> private readonly
 *      add readonly to anything you never reassign
 */
