  import { Injectable, signal, computed } from '@angular/core';

  @Injectable({ providedIn: 'root' })
  export class TimerService {
    timeLeft = signal<number>(0);
    totalTime = signal<number>(0); // Serve per calcolare la percentuale
    isRunning = signal<boolean>(false);
    
    private timerInterval: any;

    run(seconds: number) {
      this.stop();
      this.timeLeft.set(seconds);
      this.isRunning.set(true);

      this.timerInterval = setInterval(() => {
        if (this.timeLeft() > 0) {
          this.timeLeft.update(v => v - 1);
        } else {
          this.stop();
        }
      }, 1000);
    }

    start(seconds: number) {
      this.totalTime.set(seconds);
      this.run(seconds);
    }

    pause() {
      clearInterval(this.timerInterval);
      this.isRunning.set(false);
    }

    reset() {
      this.pause();
      this.timeLeft.set(0);
    }

    private stop() {
      clearInterval(this.timerInterval);
      this.isRunning.set(false);
    }

    resume() {
      if (this.timeLeft() > 0 && !this.isRunning()) {
        this.run(this.timeLeft());
      }
    }

    progress = computed(() => {
      if (this.totalTime() === 0) return 0;
      return (this.timeLeft() / this.totalTime()) * 100;
    });


    showCustomInput = signal(false);
    customTimeStr = signal<string>('00:00');

    toggleCustom() {
      this.showCustomInput.update(v => !v);
    }

      // Formatta l'input mentre l'utente scrive
    onTimeInput(event: any) {
      let val = event.target.value.replace(/\D/g, ''); // Rimuove tutto ciò che non è un numero
      if (val.length > 4) val = val.substring(0, 4); // Limita a 4 cifre (mm:ss)
      
      // Aggiunge i due punti automaticamente
      if (val.length >= 3) {
        val = val.slice(0, -2) + ':' + val.slice(-2);
      }
      this.customTimeStr.set(val);
    }

    startCustom() {
      const parts = this.customTimeStr().split(':');
      if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10) || 0;
        const seconds = parseInt(parts[1], 10) || 0;
        const totalSeconds = (minutes * 60) + seconds;
        
        if (totalSeconds > 0) {
          this.start(totalSeconds);
          this.showCustomInput.set(false);
          this.customTimeStr.set('00:00'); // Reset per la prossima volta
        }
      }
    }
  }
