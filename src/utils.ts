import {
    SHARP_NAMES,
    FLAT_NAMES,
    DEFAULT_NOTESWITCH,
    DEFAULT_STRINGSWITCH,
    STANDARD_TUNING,
    STRING_SIZE,
} from "./consts";
import {
    NoteTypes,
    LabelTypes,
    NoteSwitchType,
    StringSwitchType,
    numString,
} from "./types";

export function copy(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
}

export function mod(a: numString, m: number): number {
    return ((+a % m) + m) % m;
}

export class NoteUtil {
    base: number;
    constructor(base: number) {
        this.base = mod(base, 12);
    }

    getName(label: LabelTypes): NoteTypes {
        if (label === "sharp") {
            return SHARP_NAMES[this.base];
        } else if (label === "flat") {
            return FLAT_NAMES[this.base];
        }
    }
}

export class FretboardUtil {
    notes: NoteSwitchType;
    strings: StringSwitchType;

    constructor(
        notes: NoteSwitchType | null = DEFAULT_NOTESWITCH,
        strings: StringSwitchType | null = DEFAULT_STRINGSWITCH
    ) {
        this.notes = notes;
        this.strings = strings;
    }

    get(index: numString): boolean {
        // get note for all octaves
        return !!this.notes[mod(+index, 12)];
    }

    set(index: numString, active: boolean): boolean {
        // set note for all octaves
        if (!active) {
            this.clearFrets(mod(+index, 12));
        }
        return (this.notes[mod(+index, 12)] = active);
    }

    getDiatonicKey(root: number): number[] {
        // get list of notes in Major Scale for root
        return [0, 2, 4, 5, 7, 9, 11].map((d) => root + d);
    }

    toggle(index: number): boolean {
        return this.set(index, !this.get(index));
    }

    getFret(stringIndex: numString, fretValue: numString): boolean {
        // get individual fret in this.strings
        return !!this.strings[mod(+stringIndex, 6)][+fretValue];
    }

    setFret(
        stringIndex: numString,
        fretValue: numString,
        active: boolean
    ): boolean {
        // set individual fret in this.strings
        if (active) {
            this.set(fretValue, active);
        }
        return (this.strings[mod(+stringIndex, 6)][+fretValue] = active);
    }

    toggleFret(stringIndex: number, fretValue: number): boolean {
        // toggle individual fret in this.strings
        return this.setFret(
            stringIndex,
            fretValue,
            !this.getFret(stringIndex, fretValue)
        );
    }

    clearFrets(index: number): void {
        // clear strings
        for (let i in this.strings) {
            for (let j in this.strings[i]) {
                if (this.getFret(i, j) && mod(j, 12) == index) {
                    this.setFret(i, j, false);
                }
            }
        }
    }

    list(): number[] {
        // array of notes 0-11 that are currently selected
        const result: number[] = [];
        Object.keys(this.notes).forEach((note, i) => {
            if (this.notes[+note]) {
                result.push(+note);
            }
        });
        return result;
    }

    listFrets(): number[] {
        // array of notes 0-11 that are currently selected
        const result: NoteSwitchType = {};
        for (let string of this.strings) {
            for (let note in string) {
                if (string[+note]) {
                    result[mod(+note, 12)] = true;
                }
            }
        }
        return Object.keys(result)
            .map((note) => +note)
            .filter((note) => result[note]);
    }

    listString(stringIndex: number): number[] {
        // array of notes present on a given string
        return Object.keys(this.strings[mod(stringIndex, 6)])
            .map((key) => +key)
            .sort((a: number, b: number) => a - b);
    }

    _getIncrement(value: number, inc: number): number {
        // helper for incrementPosition
        if (inc === 0) return value;
        const scale: number[] = Object.keys(this.notes)
            .map((key) => +key)
            .filter((key) => this.notes[+key]);

        const currentDelta = value - mod(value, 12);
        const currentIndex = scale.indexOf(mod(value, 12));
        if (currentIndex < 0) return value;

        const nextIndex = mod(currentIndex + inc, scale.length);
        const nextDelta = 12 * Math.floor((currentIndex + inc) / scale.length);
        return currentDelta + scale[nextIndex] + nextDelta;
    }

    incrementPosition(inc: number): void {
        // move left/right in Pattern Mode
        const turnOff: [numString, numString][] = [];
        const turnOn: [numString, numString][] = [];
        let valid = true;
        for (let stringIndex in this.strings) {
            for (let fretValue in this.strings[stringIndex]) {
                if (this.getFret(stringIndex, fretValue)) {
                    const newValue = this._getIncrement(+fretValue, inc);
                    if (
                        newValue === +fretValue ||
                        newValue < STANDARD_TUNING[stringIndex] ||
                        newValue >= STANDARD_TUNING[stringIndex] + STRING_SIZE
                    ) {
                        valid = false;
                        break;
                    }

                    turnOff.push([stringIndex, fretValue]);
                    turnOn.push([stringIndex, newValue]);
                }
            }
            if (!valid) {
                break;
            }
        }

        if (valid) {
            for (let change of turnOff) {
                this.setFret(change[0], change[1], false);
            }

            for (let change of turnOn) {
                this.setFret(change[0], change[1], true);
            }
        }
    }

    copy(): FretboardUtil {
        return new FretboardUtil(copy(this.notes), copy(this.strings));
    }
}
