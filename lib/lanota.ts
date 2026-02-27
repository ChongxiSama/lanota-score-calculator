export interface NoteResult {
  harmony: number;
  tune: number;
  fail: number;
}

export interface RatingResult {
  rating: number;
  achievementRate: number;
  formula: string;
}

export interface ScoreResult {
  score: number;
  baseScore: number;
  comboScore: number;
}

export interface ToleranceResult {
  maxTunesFC: number;
  estimatedRating: number;
}

export function calculateRating(
  result: NoteResult,
  level: number,
  isPlus: boolean = false
): RatingResult {
  const totalNotes = result.harmony + result.tune + result.fail;
  if (totalNotes === 0) return { rating: 0, achievementRate: 0, formula: "No notes" };

  const achievementRate = (result.harmony + result.tune / 3) / totalNotes;
  
  let x = 1.0;
  
  if (isPlus) {
    if (level === 13 || level === 14) x = 1.5;
    else if (level === 15) x = 1.75;
    else if (level >= 16) x = 2.25;
  } else {
    if (level === 16) x = 1.5;
  }

  const rating = achievementRate * (level + x);
  
  return {
    rating: parseFloat(rating.toFixed(4)),
    achievementRate: parseFloat(achievementRate.toFixed(6)),
    formula: `(${result.harmony} + ${result.tune}/3) / ${totalNotes} * (${level} + ${x})`
  };
}

export function calculateScore(
    result: NoteResult,
    maxCombo: number
): ScoreResult {
    const totalNotes = result.harmony + result.tune + result.fail;
    if (totalNotes === 0) {
        return { 
            score: 0,
            baseScore: 0, 
            comboScore: 0
        };
    }

    const baseScorePerHarmony = 920000 / totalNotes;
    const baseScorePerTune = 400000 / totalNotes;
    
    const baseScoreTotal = (result.harmony * baseScorePerHarmony) + (result.tune * baseScorePerTune);
    
    const comboValues = generateComboValues(totalNotes);
    
    if (maxCombo > totalNotes) maxCombo = totalNotes;

    let comboSum = 0;
    for (let i = 0; i < maxCombo; i++) {
        comboSum += comboValues[i];
    }
    
    return {
        baseScore: Math.round(baseScoreTotal),
        comboScore: Math.round(comboSum),
        score: Math.round(baseScoreTotal + comboSum)
    };
}

export function calculateScoreTolerance(
    targetScore: number,
    totalNotes: number,
    level: number,
    isPlus: boolean = false
): ToleranceResult {
    if (totalNotes === 0) return { maxTunesFC: 0, estimatedRating: 0 };

    const maxPossibleScore = 1000000;
    
    const allowedLoss = maxPossibleScore - targetScore;
    
    if (allowedLoss < 0) {
         return { maxTunesFC: -1, estimatedRating: 0 };
    }

    const tuneLoss = 520000 / totalNotes;
    const maxTunesFC = Math.floor(allowedLoss / tuneLoss);

    const exactTunes = (allowedLoss * totalNotes) / 520000;
    const exactHarmony = totalNotes - exactTunes;
    
    const achievement = (exactHarmony + exactTunes / 3) / totalNotes;
    
    let x = 1.0;
    if (isPlus) {
        if (level === 13 || level === 14) x = 1.5;
        else if (level === 15) x = 1.75;
        else if (level >= 16) x = 2.25;
    } else {
        if (level === 16) x = 1.5;
    }

    const estimatedRating = achievement * (level + x);

    return {
        maxTunesFC,
        estimatedRating
    };
}

function generateComboValues(n: number): number[] {
    const values: number[] = new Array(n).fill(0);
    
    const comboDiff = 160000.0 / n;
    const comboUnit = 160000.0 / (n * n);

    let currentVal = comboDiff - comboUnit / 2.0;
    values[0] = currentVal;

    let halfSize = Math.ceil(n / 2.0);
    if (n % 2 === 0) halfSize += 1;

    let noteIndex = 1; 
    
    while (noteIndex < halfSize - 1) {
        currentVal -= comboUnit;
        values[noteIndex] = currentVal;
        noteIndex++;
    }

    if (n % 2 === 1) {
        const cff = n / 4.0 + 1;
        const d1 = (cff + 0.75) / 2.0;
        const d2 = cff - d1;
        
        currentVal -= comboUnit * d1;
        if (noteIndex < n) values[noteIndex] = currentVal;
        noteIndex++;
        
        currentVal -= comboUnit * d2;
        if (noteIndex < n) values[noteIndex] = currentVal;
        noteIndex++;
    } else {
        const d = n / 4.0 + 0.5;
        
        currentVal -= comboUnit * d;
        if (noteIndex < n) values[noteIndex] = currentVal;
        noteIndex++;
    }

    while (noteIndex < n) {
        values[noteIndex] = currentVal;
        noteIndex++;
    }

    return values;
}
