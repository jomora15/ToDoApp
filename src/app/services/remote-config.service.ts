import { Injectable } from '@angular/core';
import { RemoteConfig, fetchAndActivate, getValue } from '@angular/fire/remote-config';
import { from, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RemoteConfigService {

  constructor(private remoteConfig: RemoteConfig) {
  }
  loadAndActivate(): Observable<boolean> {
    return from(fetchAndActivate(this.remoteConfig)).pipe(
      tap(() => console.log('Remote Config: Valores obtenidos y activados.')),
      catchError(error => {
        console.error('Remote Config: Error al obtener o activar valores:', error);
        return of(false);
      })
    );
  }

  getFeatureFlag(key: string, defaultValue: boolean = false): Observable<boolean> {
    return this.loadAndActivate().pipe(
      switchMap(() => {
        const value = getValue(this.remoteConfig, key);
        const booleanValue = value.asBoolean();
        return of(booleanValue);
      }),
      catchError(() => {
        return of(defaultValue);
      })
    );
  }
}
