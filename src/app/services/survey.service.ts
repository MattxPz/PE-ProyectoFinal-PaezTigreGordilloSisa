import { Injectable, inject } from '@angular/core';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FIRESTORE } from '../core/firebase.providers';

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private firestore = inject(FIRESTORE);

  async guardarRespuesta(respuestas: Record<string, unknown>): Promise<void> {
    const { email, ...respuestasAnonimas } = respuestas;

    await addDoc(collection(this.firestore, 'respuestas'), {
      ...respuestasAnonimas,
      fecha: serverTimestamp(),
    });
  }
}
