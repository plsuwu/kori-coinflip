import { Component, createSignal } from 'solid-js';

interface ToggleProps {
	// text: string;
	state: boolean;
	handlerFn: () => void;
}

export const Toggle: Component<ToggleProps> = (props: ToggleProps) => {
	return (
		<>
			<div class='flex flex-col items-center'>
				<label class='relative inline-flex cursor-pointer items-center'>
					<input
						id='switch'
						type='checkbox'
						checked={props.state}
						class='peer sr-only'
						onclick={() => props.handlerFn()}
					/>
					<label for='switch' class='hidden'></label>
					<div class="peer h-6 w-11 rounded-full border border-kori-text bg-kori-bg/50 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-kori-text after:bg-kori-blue after:transition-all after:duration-200 after:content-[''] peer-checked:bg-kori-light-blue peer-checked:after:translate-x-full peer-checked:after:border-kori-text"></div>
				</label>
				<div class='my-4'></div>
                <div>autoflip is</div>
				<div class='flex h-10 w-[95px] flex-col justify-center items-center'>
					{props.state ?
						<div class='text-lg font-semibold text-kori-blue'>ENABLED</div>
					:	<div class='text-base text-kori-mid justify-center'>disabled</div>}
				</div>
			</div>
		</>
	);
};
