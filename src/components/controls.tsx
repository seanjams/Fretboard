import * as React from "react";
import styled from "styled-components";
import { FretboardContext } from "../store";

// CSS
interface CSSProps {}

const TextContainer = styled.div<CSSProps>`
    font-family: Arial;
    font-size: 14px;
    padding-left: 40px;
`;

const ButtonBank = styled.div<CSSProps>`
	display: flex;
	align-items: center;
	font-size: 10px;
	position: fixed;
    z-index: 10000;
    background: white;
`;

const ButtonContainer = styled.div<CSSProps>`
	margin: 10px;
	height: 40px;
`;

const ButtonInput = styled.button<CSSProps>`
	height: 30px;
	font-size: 14px;
    white-space: nowrap;
    min-width: 30px;
`;

// Component
interface Props {}

export const NavControls: React.FC<Props> = () => {
	const { state, dispatch } = React.useContext(FretboardContext);

	function onInvert(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
		e.preventDefault();
		if (state.invert) {
			window.scroll(0, 0);
		} else {
			window.scroll(document.body.scrollWidth, 0);
		}
		dispatch({ type: "INVERT" });
	}

	function onLeftHand(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
		e.preventDefault();
		dispatch({ type: "LEFT_HAND" });
        onInvert(e);
	}

	return (
        <ButtonBank>
            <ButtonContainer>
                <ButtonInput onClick={() => dispatch({ type: "CLEAR" })}>
                    Clear
                </ButtonInput>
            </ButtonContainer>
            <ButtonContainer>
                <ButtonInput onClick={onInvert}>Invert</ButtonInput>
            </ButtonContainer>
            <ButtonContainer>
                <ButtonInput onClick={onLeftHand}>{state.leftHand ? "Right" : "Left"} Hand</ButtonInput>
            </ButtonContainer>
            <ButtonContainer>
                <ButtonInput
                    onClick={() => dispatch({ type: "SET_LABEL", payload: { label: "sharp" }})}
                >
                    Sharp
                </ButtonInput>
            </ButtonContainer>
            <ButtonContainer>
                <ButtonInput
                    onClick={() => dispatch({ type: "SET_LABEL", payload: { label: "flat" }})}
                >
                    Flat
                </ButtonInput>
            </ButtonContainer>
            <ButtonContainer>
                <ButtonInput
                    onClick={() => dispatch({ type: "SET_LABEL", payload: { label: "value" }})}
                >
                    Value
                </ButtonInput>
            </ButtonContainer>
            <TextContainer>
                Click to set a note. Right click or Shift + click to highlight a pattern. Arrow keys Up/Down/Left/Right to move pattern.
            </TextContainer>
        </ButtonBank>
	);
};

export const AddFretboardControls: React.FC<Props> = () => {
	const { dispatch } = React.useContext(FretboardContext);
	return (
        <ButtonBank>
            <ButtonContainer>
                <ButtonInput onClick={() => dispatch({ type: "ADD_FRETBOARD" })}>
                    &#43;
                </ButtonInput>
            </ButtonContainer>
            <ButtonContainer>
                <ButtonInput onClick={() => dispatch({ type: "REMOVE_FRETBOARD" })}>
                    &minus;
                </ButtonInput>
            </ButtonContainer>
        </ButtonBank>
	);
};