import { Injectable, signal } from '@angular/core';
import { OnCallRoster } from '../models/on-call-roster.model';

@Injectable({
  providedIn: 'root',
})
export class OnCallRosterService {
  private rosters = signal<OnCallRoster[]>([
    {
      tower: 'Core Infrastructure',
      team: 'SRE Team Alpha',
      currentShift: {
        primary: {
          name: 'Alice Johnson',
          avatarUrl: 'https://picsum.photos/seed/alice/100',
          phone: '+1 (555) 123-4567',
          chat: '@alice.j',
        },
        secondary: {
          name: 'Bob Williams',
          avatarUrl: 'https://picsum.photos/seed/bob/100',
          phone: '+1 (555) 234-5678',
          chat: '@bob.w',
        },
        manager: {
          name: 'Charlie Brown',
          avatarUrl: 'https://picsum.photos/seed/charlie/100',
          phone: '+1 (555) 345-6789',
          chat: '@charlie.b',
        },
      },
    },
    {
      tower: 'Applications',
      team: 'Enrollment Hub Support',
      currentShift: {
        primary: {
          name: 'Diana Miller',
          avatarUrl: 'https://picsum.photos/seed/diana/100',
          phone: '+1 (555) 456-7890',
          chat: '@diana.m',
        },
        secondary: {
          name: 'Eve Davis',
          avatarUrl: 'https://picsum.photos/seed/eve/100',
          phone: '+1 (555) 567-8901',
          chat: '@eve.d',
        },
        manager: {
          name: 'Frank White',
          avatarUrl: 'https://picsum.photos/seed/frank/100',
          phone: '+1 (555) 678-9012',
          chat: '@frank.w',
        },
      },
    },
    {
      tower: 'Database',
      team: 'DBRE Team',
      currentShift: {
        primary: {
          name: 'Grace Taylor',
          avatarUrl: 'https://picsum.photos/seed/grace/100',
          phone: '+1 (555) 789-0123',
          chat: '@grace.t',
        },
        secondary: {
          name: 'Heidi Clark',
          avatarUrl: 'https://picsum.photos/seed/heidi/100',
          phone: '+1 (555) 890-1234',
          chat: '@heidi.c',
        },
        manager: {
          name: 'Ivan Rodriguez',
          avatarUrl: 'https://picsum.photos/seed/ivan/100',
          phone: '+1 (555) 901-2345',
          chat: '@ivan.r',
        },
      },
    },
    {
        tower: 'Security',
        team: 'SecOps On-Call',
        currentShift: {
          primary: {
            name: 'Judy Hall',
            avatarUrl: 'https://picsum.photos/seed/judy/100',
            phone: '+1 (555) 111-2222',
            chat: '@judy.h',
          },
          secondary: {
            name: 'Kevin Scott',
            avatarUrl: 'https://picsum.photos/seed/kevin/100',
            phone: '+1 (555) 222-3333',
            chat: '@kevin.s',
          },
          manager: {
            name: 'Laura Green',
            avatarUrl: 'https://picsum.photos/seed/laura/100',
            phone: '+1 (555) 333-4444',
            chat: '@laura.g',
          },
        },
      },
  ]);

  getRosters() {
    return this.rosters.asReadonly();
  }
}
