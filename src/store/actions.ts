import { LabelTypes } from "../types";

export type SetNote = {
	readonly type: "SET_NOTE";
	readonly payload: {
		fretboardIndex: number;
		note: number;
	}
};

export type SetLabel = {
	readonly type: "SET_LABEL";
	readonly payload: {
		label: LabelTypes;
	}
};

export type IncrementPosition = {
	readonly type: "INCREMENT_POSITION";
	readonly payload: {
		fretboardIndex: number;
	}
};

export type DecrementPosition = {
	readonly type: "DECREMENT_POSITION";
	readonly payload: {
		fretboardIndex: number;
	}
};

export type ClearNotes = {
	readonly type: "CLEAR";
};

export type InvertFretboard = {
	readonly type: "INVERT";
};

export type SetHighlightedNote = {
	readonly type: "SET_HIGHLIGHTED_NOTE";
	readonly payload: {
		stringIndex: number;
		value: number;
		fretboardIndex: number;
	};
};

export type AddFretboard = {
	readonly type: "ADD_FRETBOARD";
};

export type RemoveFretboard = {
	readonly type: "REMOVE_FRETBOARD";
};

export type SetFocus = {
	readonly type: "SET_FOCUS";
	readonly payload: {
		fretboardIndex: number;
	};
};

export type ActionTypes =
	| SetNote
	| SetLabel
	| ClearNotes
	| IncrementPosition
	| DecrementPosition
	| SetHighlightedNote
	| InvertFretboard
	| AddFretboard
	| RemoveFretboard
	| SetFocus;
