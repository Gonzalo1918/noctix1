import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NoctixStore } from './noctix-store';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- High-priority floating alert notification -->
    <div 
      *ngIf="store.showSuccessToast()"
      class="fixed bottom-24 lg:bottom-6 right-6 z-50 max-w-sm w-full bg-zinc-950/95 text-white border border-violet-900/40 p-4 rounded-2xl shadow-[0_20px_50px_rgba(124,58,237,0.25)] flex items-start space-x-3 backdrop-blur-md animate-fade-in transition duration-300">
      
      <!-- Icon with dynamic pulse glow -->
      <div class="p-2 bg-violet-600/10 rounded-xl border border-violet-500/25 text-violet-400 shrink-0">
        <mat-icon class="text-sm">verified_user</mat-icon>
      </div>

      <!-- Copy labels -->
      <div class="flex-1 space-y-1 text-left">
        <span class="text-[10px] font-mono font-black text-violet-400 tracking-wider block uppercase">NOTIFICACIÓN NOCTIX</span>
        <p class="text-xs text-zinc-200 leading-normal font-sans">{{ store.toastMessage() }}</p>
      </div>

      <!-- Action Close -->
      <button 
        (click)="store.showSuccessToast.set(false)"
        class="text-zinc-500 hover:text-white transition focus:outline-none cursor-pointer">
        <mat-icon class="text-xs">close</mat-icon>
      </button>

    </div>
  `
})
export class Toast {
  store = inject(NoctixStore);
}
