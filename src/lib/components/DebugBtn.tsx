import { debugClicker } from "../worker";

export const DebugBtn = () => {
    const fireEvt = () => {
        debugClicker();
    }

    return (
        <button onclick={fireEvt}>test event</button>
    );
}
