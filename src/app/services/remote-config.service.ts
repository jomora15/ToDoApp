import { Injectable } from '@angular/core';
import { RemoteConfig, fetchAndActivate, getValue } from '@angular/fire/remote-config';
import { EMPTY, from, Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RemoteConfigService {

  constructor(private remoteConfig: RemoteConfig) {
    // ¡REMOVER EN PRODUCCIÓN!
    remoteConfig.settings.minimumFetchIntervalMillis = 10000;
    remoteConfig.settings.fetchTimeoutMillis = 60000;
  }

  /**
  * Carga los valores de Remote Config y activa la configuración.
  * Retorna un observable con true si la carga y activación fueron exitosas.
  */
  loadAndActivate(): Observable<boolean> {
    return from(fetchAndActivate(this.remoteConfig)).pipe(
      tap(() => console.log('Remote Config: Valores obtenidos y activados.')),
      catchError(error => {
        console.error('Remote Config: Error al obtener o activar valores:', error);
        // Si hay un error, se usa el valor predeterminado en la aplicación
        return of(false); // Indica que la operación no fue exitosa pero no detiene la app
      })
    );
  }

  /**
   * Obtiene el valor booleano de un feature flag específico.
   * Asegúrate de llamar a loadAndActivate() antes de usar este método si necesitas los valores más recientes.
   * @param key La clave del feature flag (ej. 'is_new_feature_enabled').
   * @param defaultValue El valor predeterminado si la clave no existe o hay un error.
   * @returns Un observable que emite el valor booleano del feature flag.
   */
  getFeatureFlag(key: string, defaultValue: boolean = false): Observable<boolean> {
    return this.loadAndActivate().pipe( // Siempre intenta cargar y activar primero
      switchMap(() => {
        const value = getValue(this.remoteConfig, key);
        const booleanValue = value.asBoolean();
        console.log(`Remote Config: Feature flag '${key}' es ${booleanValue}`);
        return of(booleanValue);
      }),
      catchError(error => {
        console.error(`Remote Config: Error al obtener el feature flag '${key}':`, error);
        return of(defaultValue); // Devuelve el valor predeterminado en caso de error
      })
    );
  }
}
