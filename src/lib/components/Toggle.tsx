import { Component } from 'solid-js';

interface ToggleProps {
	text: string;
	state: boolean;
	handlerFn: () => void;
}

export const Toggle: Component<ToggleProps> = (props: ToggleProps) => {
	return (
		<>
			<label class='relative inline-flex cursor-pointer items-center'>
				<input
					id='switch-2'
					type='checkbox'
					checked={props.state}
					class='peer sr-only'
					onclick={() => props.handlerFn()}
				/>
				<label for='switch-2' class='hidden'></label>
				<div class="peer h-4 w-11 rounded-full border bg-slate-200 after:absolute after:-top-1 after:left-0 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-300 peer-checked:after:translate-x-full peer-focus:ring-green-300"></div>
			</label>
		</>
	);
};
