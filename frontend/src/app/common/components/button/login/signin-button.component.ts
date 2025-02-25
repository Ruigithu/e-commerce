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
        background-color: #578E7E;
        width: 100px;
        height: 40px;
        color: #FFFAEC;
        border: none;
        border-radius: 10px;
      }
    `
  }
)
export class  SigninComponentButton{}
