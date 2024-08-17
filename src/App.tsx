import { createSignal, onMount, type Component } from 'solid-js';
import { debugGramble } from './lib/worker';


const App: Component = () => {
    const runDebugGramble = () => {
        debugGramble();
    }

	return (
		<>
            <div class="flex items-center justify-center">
                <button onclick={runDebugGramble}>
                    debug gramble
                </button>
            </div>
		</>
	);
};

export default App;
