import { createSignal, onMount, type Component } from "solid-js";
import { Toggle } from "./lib/components/Toggle";

const App: Component = () => {
    const textOptions = [
        'off',
        'on',
    ];
    const [enabled, setEnabled] = createSignal(false);
    const [text, setText] = createSignal(textOptions[0]);


    onMount(() => {
        chrome.storage.local.get(['enabled'], (result) => {
            if (result.enabled !== undefined) {
                setEnabled(result.enabled);
            }
        });
    });

    const toggle = () => {
        // flip true/false state
        const state = !enabled();
        const ref = state ? 'on' : 'off';

        setEnabled(state);
        setText(ref);
        chrome.storage.local.set({ enabled: state, text: ref }, () => {
            console.log('[+] Setting new state: ', state);
        });
        chrome.runtime.sendMessage({ type: 'STATE_CHANGED', enabled: state });
    };

	return (
		<div>
			<div class='flex flex-col items-center justify-center text-xl font-semibold'>
				<div class='my-8'>kori coinflip</div>
				<div class='relative mx-8 mb-8 inline-flex flex-1 justify-center'></div>
                <Toggle text={text()} state={enabled()} handlerFn={toggle} />

			</div>
		</div>
	);
};

export default App;
