import { Component } from "solid-js";

interface ClearLocalProps {
    handleParentEvent: () => void;
}

export const ClearLocal: Component<ClearLocalProps> = (props: ClearLocalProps) => {
    return (
        <>
            <button onclick={props.handleParentEvent}>
                clear all data
            </button>
        </>
    );
}
