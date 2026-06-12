import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer>
      <p>&copy; 2026 Noctix P2P Protocol. All rights reserved.</p>
    </footer>
  `,
  styles: [`
    footer {
      text-align: center;
      padding: 2rem;
      border-top: 1px solid #27272a;
      margin-top: 3rem;
      color: #71717a;
    }
  `]
})
export class FooterComponent {}
