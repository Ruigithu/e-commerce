import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component(
  {
    selector: `signin-button`,
    template: `
      <button routerLink="/login">Sign in</button>
    `,
    standalone: true,
    imports: [
      RouterLink
    ],
    styles: `
      button {
        background-color: darkseagreen;
      }
    `
  }
)
export class  SigninComponentButton{}
