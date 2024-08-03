
// this doesnt have to be super complex so we just fuck
export const fiftyfifty = () => {
    let res = Math.random();

    if (res > 0.5) {
        return 0;
    } else {
        return 1;
    }
}
