function rand() {
    return Math.random() > 0.5 ? 1 : 0
}

for (let i = 0; i < 5; ++i) {
    console.log(rand());
}
