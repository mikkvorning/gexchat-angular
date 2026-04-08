import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, pipe, switchMap, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { SnackbarService } from '@core/services/snackbar.service';
import { CurrentUser } from '@core/models/user.model';

interface AuthState {
  user: CurrentUser | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user }) => ({
    isAuthenticated: computed(() => !!user()),
    isGuest: computed(() => !!user()?.isGuest),
  })),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      router = inject(Router),
      snackbar = inject(SnackbarService),
    ) => ({
      loginAsGuest: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((username) =>
            authService.loginAsGuest(username).pipe(
              tap((user) => {
                patchState(store, { user, isLoading: false });
                router.navigate(['/']);
              }),
              catchError((err: Error) => {
                patchState(store, { isLoading: false, error: err.message });
                snackbar.error(err.message);
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      logout: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() =>
            authService.logout().pipe(
              tap(() => {
                patchState(store, { ...initialState });
                router.navigate(['/login']);
              }),
              catchError((err: Error) => {
                patchState(store, { isLoading: false, error: err.message });
                snackbar.error(err.message);
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
    }),
  ),
);
