import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api-endpoints';
import { Post } from '@core/models/post.model';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';

/**
 * Shows the list of posts, written in the OLD Angular style on purpose.
 * Compare with UserList, which does the same job the modern way.
 */
@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.html',
})
export class PostList implements OnInit, OnDestroy {
  // OLD: a plain property instead of a signal.
  posts: Post[] = [];

  // OLD: keep the subscription so we can unsubscribe manually.
  private subscription?: Subscription;

  // OLD: dependencies injected through the constructor instead of inject().
  // ESLint flags this as outdated (prefer-inject); disabled here only for the demo.
  /* eslint-disable @angular-eslint/prefer-inject */
  constructor(
    private readonly api: ApiService,
    protected readonly auth: AuthService,
    private readonly cdr: ChangeDetectorRef,
  ) {}
  /* eslint-enable @angular-eslint/prefer-inject */

  // OLD: load data in ngOnInit and subscribe manually.
  ngOnInit(): void {
    this.subscription = this.api
      .get<Post[]>(API_ENDPOINTS.posts, { params: { _limit: 20 } })
      .subscribe((posts) => {
        this.posts = posts;
        // This app is zoneless. Old apps used zone.js, which re-rendered automatically
        // after any async callback. Without it, changing a plain property does not update
        // the view, so we must tell Angular ourselves. (Signals do this automatically.)
        this.cdr.markForCheck();
      });
  }

  // OLD: clean up manually when the component is destroyed.
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
