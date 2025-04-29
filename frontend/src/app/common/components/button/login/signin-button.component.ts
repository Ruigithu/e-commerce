import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';

@Component(
  {
    selector: `signin-button`,
    template: `
      <button routerLink="/login" class="signin-button">
        <i class="fa-solid fa-user"></i>
        <span>Sign in</span>
      </button>
    `,
    standalone: true,
    imports: [
      RouterLink
    ],
    styles: `
      .signin-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background-color: #578E7E;
        color: white;
        border: none;
        border-radius: 24px;
        padding: 0.6rem 1.2rem;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .signin-button:hover {
        background-color: #477a6c;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .signin-button:active {
        transform: translateY(0);
      }
    `
  }
)
export class SigninComponentButton {}
