import { createSignal, onMount, type Component } from 'solid-js';
import { gramble } from './lib/worker';


const App: Component = () => {
    const runDebugGramble = () => {
        gramble();
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
