import { createSignal } from 'solid-js';

// export const [predict, setPredict] = createSignal<number | undefined>(undefined);
//

// this doesnt have to be super complex so we just fuck
export const flipped = () => {
    return Math.random() >= 0.5 ? 1 : 0;
};

export const predict = async () => {

    return new Promise((resolve, reject) => {
        const channelPointsButton = document.querySelector(
            'button[aria-label="Bits and Points Balances"]'
        ) as HTMLButtonElement;

        if (!channelPointsButton) {
            return reject('[-] Cannot find channel points toggle button.');
        }

        const handle = () => {
            const channelPointsQuery = document.querySelector(
                'button[aria-label*="Click to learn how to earn more"]'
            ) as HTMLButtonElement;

            if (channelPointsQuery) {
                const attr = channelPointsQuery.getAttribute('aria-label');
                const matched = attr?.match(/\d{1,3}(,\d{3})*/);
                const favors = matched?.[0] as unknown as number;

                resolve(favors);
            } else {
                reject('[-] Cannot find queryable channel points element.');
            }
        }
        const observer = new MutationObserver((muts) => {
            muts.forEach((mut) => {
                    if (mut.type === 'childList' || mut.type === 'attributes') {
                        handle();
                        observer.disconnect();
                    }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        channelPointsButton.click();
    })
};

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === 'predict') {

        predict().then((res) => {
            sendResponse({ status: 'complete', favors: res });
            // chrome.storage.local.set({ favors: res }, () => {
            // });
        }).catch((error) => {
            console.error('Error in predict:', error);
            sendResponse({ status: 'error', message: error.message });
        });

        // indicate that we will send a response asynchronously
        return true;
    }
});
