import { EnvironmentProviders, InjectionToken, inject, makeEnvironmentProviders } from '@angular/core';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('FIREBASE_APP');
export const FIRESTORE = new InjectionToken<Firestore>('FIRESTORE');

export function provideFirebaseApp(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: FIREBASE_APP, useFactory: () => initializeApp(environment.firebaseConfig) },
  ]);
}

export function provideFirestore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: FIRESTORE, useFactory: () => getFirestore(inject(FIREBASE_APP)) },
  ]);
}
