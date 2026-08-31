function setInputValue(input, value) {

    if (!input)
        return;

    input.focus();

    const setter =
        Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value"
        )?.set;

    if (setter) {
        setter.call(input, value);
    }
    else {
        input.value = value;
    }

    input.dispatchEvent(
        new Event("input", {
            bubbles: true
        })
    );

    input.dispatchEvent(
        new Event("change", {
            bubbles: true
        })
    );
}


function tryAutofill(username, password) {

    const passwordInput =
        document.querySelector(
            'input[type="password"]'
        );


    const usernameInput =
        document.querySelector(
            'input[type="email"],' +
            'input[autocomplete="username"],' +
            'input[name*="email" i],' +
            'input[name*="user" i],' +
            'input[type="text"]'
        );


    if (
        usernameInput &&
        !usernameInput.value
    ) {
        setInputValue(
            usernameInput,
            username
        );
    }


    if (
        passwordInput &&
        !passwordInput.value
    ) {
        setInputValue(
            passwordInput,
            password
        );

        return true;
    }

    return false;
}

chrome.runtime.onMessage.addListener(
    (message) => {

        if (message.type !== "AUTOFILL")
            return;


        tryAutofill(
            message.username,
            message.password
        );


        const observer =
            new MutationObserver(() => {

                const passwordFilled =
                    tryAutofill(
                        message.username,
                        message.password
                    );


                if (passwordFilled) {

                    observer.disconnect();
                }

            });


        observer.observe(
            document.documentElement,
            {
                childList: true,
                subtree: true
            }
        );


        setTimeout(() => {
            observer.disconnect();
        }, 120000);
    }
);
