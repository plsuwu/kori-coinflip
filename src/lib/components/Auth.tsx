import { Component, createSignal, onMount } from 'solid-js';
import { UserData } from '../../App';

interface Props {
    token: string;
    user: UserData;
    loading: boolean;
    logout: () => void;
    fetchToken: () => void;
}

export const Auth: Component<Props> = (props: Props) => {
	// const VALIDATE_URL = 'https://id.twitch.tv/oauth2/validate';


	return (
		<div class='mx-4 my-8 flex flex-col justify-center items-center space-y-2'>
			{props.token && props.user.login && (
				<>
					<div>
						omg <span class='rounded-md bg-kori-light-blue/25 px-0.5 py-px'>@{props.user.login}</span>{' '}
						hiii
					</div>
					<button
						onclick={props.logout}
						class='rounded-md border border-kori-light-blue px-0.5 py-px text-[0.7rem] transition-colors duration-300 ease-in-out hover:bg-kori-light-blue/30 hover:text-kori-text/75'>
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
						class='rounded-md border border-kori-light-blue px-0.5 py-px text-[0.7rem] transition-colors duration-300 ease-in-out hover:bg-kori-light-blue/30 hover:text-kori-text/75'>
                        authorize with twitch
					</button>
                </>
			)}
		</div>
	);
};


