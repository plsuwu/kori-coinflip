import { Component, createSignal, onMount } from 'solid-js';
import { UserData } from '../../App';

interface Props {
	token: string;
	user: UserData;
	logout: () => void;
	fetchToken: () => void;
	points: string;
}

interface PointProps {
	points: string;
}

const ChannelPoints: Component<PointProps> = (props: PointProps) => {
	return (
		<>
			<div class='mb-4 mt-2 flex flex-col items-center'>
				<div class='text-sm'>
					<span class='text-red-300'>
						{Number(props.points).toLocaleString()}
					</span>{' '}
					points
				</div>
			</div>
		</>
	);
};

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
					<div class='mb-4'>
						{props.points && (
							<ChannelPoints points={props.points} />
						)}
						{!props.points && <div>+</div>}
					</div>

					<button
						onclick={props.logout}
						class='rounded-md border border-kori-light-blue px-1 py-px text-[0.8rem] transition-colors duration-300 ease-in-out hover:bg-kori-light-blue/30 hover:text-kori-text/75'
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
