import { Injectable } from '@nestjs/common';

@Injectable()
export class SuperMemoService {
  calculateEFactor(oldEFactor, quality) {
    let newEFactor =
      oldEFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

    if (newEFactor < 1.3) {
      newEFactor = 1.3;
    }

    return newEFactor;
  }

  calculateInterval(n, eFactor, quanlity) {
    if (n === 1) {
      return 1;
    } else if (n === 2) {
      return 6;
    } else if (n > 2) {
      return Math.round((n - 1) * this.calculateEFactor(eFactor, quanlity));
    } else {
      return 0;
    }
  }
}
