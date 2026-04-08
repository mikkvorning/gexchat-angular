import { inject, Injectable } from '@angular/core';
import { Auth, signInAnonymously, signOut } from '@angular/fire/auth';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { from, Observable, switchMap } from 'rxjs';
import { CurrentUser } from '@core/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  loginAsGuest(username: string): Observable<CurrentUser> {
    return from(signInAnonymously(this.auth)).pipe(
      switchMap((credential) => {
        const user: CurrentUser = {
          id: credential.user.uid,
          displayName: username,
          username: username.toLowerCase().replace(/\s+/g, '_'),
          status: 'online',
          isGuest: true,
          createdAt: new Date(),
          chats: [],
          blocked: [],
          privacy: {
            showStatus: false,
            showLastSeen: false,
            showActivity: false,
          },
          notifications: {
            enabled: true,
            sound: true,
            muteUntil: null,
          },
          friends: {
            list: [],
            pending: [],
          },
        };
        return from(
          setDoc(doc(this.firestore, 'users', user.id), user).then(() => user),
        );
      }),
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }
}
