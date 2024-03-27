// Start chain of function calls

try {
    const runner = new Models.ModelRunner();
    console.log(`init ModelRunner: ${JSON.stringify(runner, null, 10)}`)
    runner.init();
} catch (error) {
    console.error(`Error in html script: ${error.message}`);
}