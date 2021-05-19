import { fill } from "lodash";
import * as React from "react";
import styled from "styled-components";
import {
	STANDARD_TUNING,
	FRETBOARD_WIDTH,
	STRING_SIZE,
	CIRCLE_SIZE,
} from "../consts";
import { useStore, Store, StateType, reducer } from "../store";
import { DiffType } from "../types";
import { mod, NoteUtil, COLORS, FretboardUtil } from "../utils";

// CSS
interface CSSProps {
	width?: number;
	height?: number;
	border?: string;
	color?: string;
	backgroundColor?: string;
	left?: number;
}

const FretDiv = styled.div.attrs((props: CSSProps) => ({
	style: {
		borderLeft: props.border,
		borderRight: props.border,
		width: `${props.width}%`,
	},
}))<CSSProps>`
	height: 33px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	position: relative;
`;

const CircleDiv = styled.div.attrs((props: CSSProps) => ({
	style: {
		color: props.color,
	},
}))<CSSProps>`
	margin-left: -13px;
	margin-right: -13px;
	border: 1px solid #333;
	color: #333;
	display: flex;
	justify-content: center;
	align-items: center;
	width: 26px;
	height: 26px;
	border-radius: 100%;
	background-color: transparent;
	z-index: 9999;
`;

const ShadowDiv = styled.div.attrs((props: CSSProps) => ({
	style: {
		left: `${props.left}%`,
		width: props.width,
		backgroundColor: props.backgroundColor,
	},
}))<CSSProps>`
	margin-left: -13px;
	margin-right: -13px;
	width: 26px;
	height: 26px;
	border-radius: 100%;
	z-index: 9998;
	position: absolute;
	top: 4px;
`;

const LineDiv = styled.div.attrs((props: CSSProps) => ({
	style: {
		height: `${props.height}px`,
		backgroundColor: props.backgroundColor,
	},
}))<CSSProps>`
	width: calc(50% - 13px);
	margin: auto 0;
`;

// Component
interface Props {
	value: number;
	stringIndex: number;
	openString?: boolean;
	store: Store<StateType>;
}

export const Fret: React.FC<Props> = ({
	value,
	openString,
	stringIndex,
	store,
}) => {
	const [state, setState] = useStore(store);
	const shadowRef = React.useRef<HTMLDivElement>();
	const backgroundColorRef = React.useRef<string>();
	const stateRef = React.useRef(state);

	const fretboard = state.fretboards[state.focusedIndex];
	const noteValue = mod(value, 12);
	// const [secondaryColor, primaryColor] = COLORS[mod(fretboardIndex, COLORS.length)];
	const [secondaryColor, primaryColor] = COLORS[0];

	const note = new NoteUtil(value);
	const label =
		state.label === "value" ? noteValue : note.getName(state.label);
	const isHighlighted = fretboard.getFret(stringIndex, value);
	const backgroundColor = isHighlighted
		? primaryColor
		: fretboard.get(value)
		? secondaryColor
		: "transparent";
	// const color = isHighlighted ? "white" : "#333";
	const color = false ? "white" : "#333";
	const fretIndex = value - STANDARD_TUNING[stringIndex];

	// makes frets progressively smaller
	// what did I even do here. Basically its some line
	// const fretWidth = (1 + (12 - fretIndex) / 30) * 8.333333;

	// temporary until I scale it to no moving target
	const fretWidth = FRETBOARD_WIDTH / STRING_SIZE;

	const thickness = (6 - stringIndex + 1) / 2;
	const border = openString ? "none" : "1px solid #333";

	// initiate refs
	stateRef.current = state;
	backgroundColorRef.current = backgroundColor;

	const is = (
		diff: DiffType,
		key: number,
		val: any,
		negate: boolean = false
	) => diff && (negate ? diff[key] !== val : diff[key] === val);
	const isNot = (diff: DiffType, key: number, val: any) =>
		is(diff, key, val, true);

	React.useEffect(() => {
		const fretboard =
			stateRef.current.fretboards[stateRef.current.focusedIndex];
		if (fretboard.notes[noteValue] && shadowRef.current) {
			setCircleDiameter(CIRCLE_SIZE);
			setBackgroundColor(backgroundColorRef.current);
		}
	}, [fretboard.notes]);

	React.useEffect(
		() =>
			store.addListener(({ progress }) => {
				if (!shadowRef.current) return;
				let newLeft;
				let fillPercentage;
				let background = backgroundColorRef.current || "transparent";

				const i = stateRef.current.focusedIndex; // to battle verbosity
				const leftDiff = stateRef.current.leftDiffs[i];
				const rightDiff = stateRef.current.rightDiffs[i];

				const leftExists = isNot(leftDiff, noteValue, undefined);
				const rightExists = isNot(rightDiff, noteValue, undefined);
				const leftEmpty = is(leftDiff, noteValue, -9999);
				const rightEmpty = is(rightDiff, noteValue, -9999);
				const leftFill = is(leftDiff, noteValue, 9999);
				const rightFill = is(rightDiff, noteValue, 9999);

				let x: number;
				let diffSteps: number;

				const origin = 50;
				const leftWindow = 0.25;
				const rightWindow = 0.75;
				const windowLength = 1 + leftWindow - rightWindow;

				switch (true) {
					// all altered notes should be 50% to the left
					case leftExists && progress < i:
						// if (noteValue === 7) console.log("in here");
						if (leftEmpty) {
							fillPercentage = 100;
						} else if (leftFill) {
							fillPercentage = 0;
						} else {
							newLeft = leftDiff[noteValue] * 50 + origin;
						}
					// all altered notes should be x% to the left
					case leftExists &&
						i <= progress &&
						progress <= i + leftWindow:
						x = ((i + leftWindow - progress) * 100) / windowLength;

						if (leftEmpty) {
							fillPercentage = 100 - x;
						} else if (leftFill) {
							fillPercentage = x;
							background = secondaryColor;
						} else {
							diffSteps = leftDiff[noteValue];
							newLeft = diffSteps * x + origin;
						}
						break;
					// all altered notes should be in the middle
					case i + leftWindow < progress &&
						progress <= i + rightWindow:
						if (leftEmpty || rightEmpty) {
							fillPercentage = 100;
						} else if (leftFill || rightFill) {
							fillPercentage = 0;
						}
						newLeft = 50;
						break;
					// all altered notes should be x% to the left
					case rightExists &&
						i + rightWindow < progress &&
						progress < i + 1:
						x =
							((progress - (i + rightWindow)) * 100) /
							windowLength;

						if (rightEmpty) {
							fillPercentage = 100 - x;
						} else if (rightFill) {
							fillPercentage = x;
							background = secondaryColor;
						} else {
							diffSteps = rightDiff[noteValue];
							newLeft = diffSteps * x + origin;
						}
						break;
					// all altered notes should be 50% to the right
					case rightExists && i + 1 <= progress:
						if (rightEmpty) {
							fillPercentage = 100;
						} else if (rightFill) {
							fillPercentage = 0;
						} else {
							diffSteps = rightDiff[noteValue];
							newLeft = diffSteps * 50 + origin;
						}
						break;
				}

				if (newLeft !== undefined) {
					shadowRef.current.style.left = `${newLeft}%`;
				}
				if (fillPercentage !== undefined) {
					const diameter = (CIRCLE_SIZE * fillPercentage) / 100;
					setCircleDiameter(diameter);
				}

				setBackgroundColor(background);
			}),
		[]
	);

	function onContextMenu(e?: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		e && e.preventDefault();
		setState(
			reducer(state, {
				type: "SET_HIGHLIGHTED_NOTE",
				payload: {
					stringIndex,
					value,
				},
			})
		);
	}

	const setCircleDiameter = (diameter: number) => {
		if (shadowRef.current) {
			const radius = diameter / 2;
			shadowRef.current.style.width = `${diameter}px`;
			shadowRef.current.style.height = `${diameter}px`;
			shadowRef.current.style.marginLeft = `-${radius}px`;
			shadowRef.current.style.marginRight = `-${radius}px`;
			shadowRef.current.style.top = `${4 - radius + CIRCLE_SIZE / 2}px`;
		}
	};

	const setBackgroundColor = (backgroundColor: string) => {
		if (shadowRef.current) {
			shadowRef.current.style.backgroundColor = backgroundColor;
		}
	};

	function onClick(
		e:
			| React.TouchEvent<HTMLDivElement>
			| React.MouseEvent<HTMLDivElement, MouseEvent>
	) {
		const conditions = [];
		if (e.nativeEvent instanceof MouseEvent) {
			conditions.push(e.nativeEvent.metaKey, e.nativeEvent.shiftKey);
		} else if (e.nativeEvent instanceof TouchEvent) {
			conditions.push(e.nativeEvent.touches.length > 1);
		} else {
			return;
		}

		if (conditions.some((condition) => condition)) {
			onContextMenu();
		} else {
			setState(
				reducer(state, {
					type: "SET_NOTE",
					payload: {
						note: value,
					},
				})
			);
		}
	}

	return (
		<FretDiv
			border={border}
			width={fretWidth}
			onContextMenu={onContextMenu}
		>
			<LineDiv
				height={thickness}
				backgroundColor={!!fretIndex ? "#333" : "transparent"}
			/>
			<CircleDiv
				onClick={onClick}
				onTouchStart={onClick}
				backgroundColor={backgroundColor}
				color={color}
			>
				{label}
			</CircleDiv>
			<ShadowDiv
				ref={shadowRef}
				backgroundColor={backgroundColor}
				left={50}
			/>
			<LineDiv
				height={thickness}
				backgroundColor={!!fretIndex ? "#333" : "transparent"}
			/>
		</FretDiv>
	);
};
