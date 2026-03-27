import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarRef,
  TextOnlySnackBar,
} from '@angular/material/snack-bar';

export type SnackbarType = 'info' | 'success' | 'warning' | 'error';

export interface SnackbarOptions extends MatSnackBarConfig {
  action?: string;
}

/**
 * App-level snackbar wrapper:
 * - centralizes default config
 * - maps semantic types to themed panel classes
 */
@Injectable({ providedIn: 'root' })
export class SnackbarService {
  /** Shared defaults for all snackbars unless explicitly overridden. */
  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 3500,
    horizontalPosition: 'center',
    verticalPosition: 'top',
  };

  /** Semantic type -> global CSS class used by theme overrides. */
  private readonly panelClassByType: Record<SnackbarType, string> = {
    info: 'app-info',
    success: 'app-success',
    warning: 'app-warning',
    error: 'app-error',
  };

  constructor(private readonly snackBar: MatSnackBar) {}

  /**
   * Opens a snackbar with semantic styling and merged defaults.
   * Callers can still override any MatSnackBar config via `options`.
   */
  show(
    message: string,
    type: SnackbarType = 'info',
    options: SnackbarOptions = {},
  ): MatSnackBarRef<TextOnlySnackBar> {
    const { action = 'Dismiss', panelClass, ...config } = options;

    return this.snackBar.open(message, action, {
      ...this.defaultConfig,
      ...config,
      panelClass: [
        this.panelClassByType[type],
        ...this.coercePanelClass(panelClass),
      ],
    });
  }

  /** Convenience alias for show(message, 'info', options). */
  info(
    message: string,
    options: SnackbarOptions = {},
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(message, 'info', options);
  }

  /** Convenience alias for show(message, 'success', options). */
  success(
    message: string,
    options: SnackbarOptions = {},
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(message, 'success', options);
  }

  /** Convenience alias for show(message, 'warning', options). */
  warning(
    message: string,
    options: SnackbarOptions = {},
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(message, 'warning', options);
  }

  /** Convenience alias for show(message, 'error', options). */
  error(
    message: string,
    options: SnackbarOptions = {},
  ): MatSnackBarRef<TextOnlySnackBar> {
    return this.show(message, 'error', options);
  }

  /**
   * Normalizes panelClass to string[].
   * MatSnackBar accepts string | string[] | undefined, but we always spread arrays.
   */
  private coercePanelClass(
    panelClass: MatSnackBarConfig['panelClass'],
  ): string[] {
    if (!panelClass) {
      return [];
    }

    return Array.isArray(panelClass) ? panelClass : [panelClass];
  }
}
