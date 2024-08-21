import { Component } from "solid-js";

interface ClearLocalProps {
    handleParentEvent: () => void;
}

export const ClearLocal: Component<ClearLocalProps> = (props: ClearLocalProps) => {
    return (
        <>
            <button onclick={props.handleParentEvent}
                    class='hover:text-kori-blue transition-colors ease-in-out duration-200'
            >
                clear all data
            </button>
        </>
    );
}
