import * as React from "react";
import styled from "styled-components";
import {
	STANDARD_TUNING,
	NATURAL_NOTE_NAMES,
	FRETBOARD_WIDTH,
	E,
	B,
	C,
	F,
} from "../consts";
import { FretboardContext } from "../store";
import { String } from "./string";
import { Legend } from "./legend";
import { getPositionActionType } from "../utils";

// CSS
interface CSSProps {
	width?: number;
	color?: string;
}

const FretboardContainer = styled.div.attrs((props: CSSProps) => ({
	style: {
		width: `${props.width}px`,
	},
}))<CSSProps>`
	display: flex;
	align-items: stretch;
`;

const FretboardDiv = styled.div<CSSProps>`
	display: flex;
	flex-direction: column;
	width: 100%;
`;

// Component
interface Props {}

export const Fretboard: React.FC<Props> = () => {
	const { state, dispatch } = React.useContext(FretboardContext);
	const invertRef = React.useRef(false);
	const leftHandRef = React.useRef(false);
	const focusedIndexRef = React.useRef(0);
	invertRef.current = state.invert;
	leftHandRef.current = state.leftHand;
	focusedIndexRef.current = state.focusedIndex;

	// whether the high E string appears on the top or bottom of the fretboard,
	// depending on invert/leftHand views
	const highEBottom = state.invert !== state.leftHand;

	let naturals: { [key in string]: number } = {};
	let i = 0;
	for (let name of NATURAL_NOTE_NAMES) {
		if (state.label === "flat") {
			naturals[name] = i;
			if (name !== F && name !== C) i++;
			naturals[name.toLowerCase()] = i;
			i++;
		} else if (state.label === "sharp") {
			naturals[name.toLowerCase()] = i;
			if (name !== E && name !== B) i++;
			naturals[name] = i;
			i++;
		}
	}

	React.useEffect(() => {
		window.addEventListener("keydown", onKeyPress);
		return () => {
			window.removeEventListener("keydown", onKeyPress);
		};
	});

	const strings = STANDARD_TUNING.map((value, i) => {
		return <String stringIndex={i} base={value} key={`string-${i}`} />;
	});

	function onKeyPress(this: Window, e: KeyboardEvent): any {
		const actionType = getPositionActionType(
			invertRef.current,
			leftHandRef.current,
			e.key
		);
		if (actionType) {
			e.preventDefault();
			dispatch({
				type: actionType,
			});
		} else if (naturals.hasOwnProperty(e.key)) {
			e.preventDefault();
			dispatch({
				type: "SET_NOTE",
				payload: {
					note: naturals[e.key],
				},
			});
		}
	}

	return (
		<FretboardContainer width={FRETBOARD_WIDTH}>
			<FretboardDiv>
				<Legend top={true} />
				{highEBottom ? strings : strings.reverse()}
				<Legend />
			</FretboardDiv>
		</FretboardContainer>
	);
};
