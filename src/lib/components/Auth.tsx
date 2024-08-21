import { Component, createSignal, onMount } from 'solid-js';
import { UserData } from '../../App';

interface Props {
	token: string;
	user: UserData;
	logout: () => void;
	fetchToken: () => void;
}

export const Auth: Component<Props> = (props: Props) => {
	return (
		<div class='m-4 flex flex-col items-center justify-center space-y-2'>
			{props.token && props.user.login && (
				<>
					<div class='space-x-2 text-lg'>
						omg{' '}
							<a
								href={`https://twitch.tv/${props.user.login}`}
								target='_blank'
								rel='noreferrer'
							>
                            <span class='rounded-md bg-kori-light-blue/25 px-0.5 py-px'>
								@{props.user.login}
                                </span>
							</a>{' '}
						hiii
					</div>
					<button
						onclick={props.logout}
						class='rounded-md border border-kori-light-blue text-[0.8rem] px-1 py-px transition-colors duration-300 ease-in-out hover:bg-kori-light-blue/30 hover:text-kori-text/75'
					>
						logout
					</button>
				</>
			)}
			{!props.token && (
				<>
					<div>
						<span class='rounded-md px-1 py-px'></span>
					</div>
					<button
						onclick={props.fetchToken}
						class='rounded-md border border-kori-light-blue px-3 py-px text-lg transition-colors duration-300 ease-in-out hover:bg-kori-light-blue/30 hover:text-kori-text/75'
					>
						authorize via twitch
					</button>
				</>
			)}
		</div>
	);
};
