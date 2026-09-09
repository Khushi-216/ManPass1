let currentCredentials = [];
let suggestionBox = null;
let selectedCredential = null;

function normalizeHost(host) {
    return host
        .toLowerCase()
        .replace(/^www\./, "");
}


function hostsMatch(savedHost, currentHost) {

    savedHost = normalizeHost(savedHost);
    currentHost = normalizeHost(currentHost);

    return (
        savedHost === currentHost ||
        currentHost.endsWith("." + savedHost) ||
        savedHost.endsWith("." + currentHost)
    );
}


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


function findUsernameInput() {

    return document.querySelector(
        'input[type="email"],' +
        'input[autocomplete="username"],' +
        'input[name*="email" i],' +
        'input[name*="user" i],' +
        'input[type="text"]'
    );
}


function findPasswordInput() {

    return document.querySelector(
        'input[type="password"]'
    );
}


async function loadCredentials() {

    try {

        const result =
            await chrome.runtime.sendMessage({
                type: "GET_CREDENTIALS"
            });


        if (!result || !result.success) {

            console.error(
                "WeRemember error:",
                result?.error
            );

            return;
        }


        const credentials =
            result.data;


        const currentHost =
            window.location.hostname;


        currentCredentials =
            credentials.filter(
                credential => {

                    if (!credential.websiteUrl)
                        return false;


                    try {

                        const savedHost =
                            new URL(
                                credential.websiteUrl
                            ).hostname;


                        return hostsMatch(
                            savedHost,
                            currentHost
                        );

                    }
                    catch {
                        return false;
                    }

                }
            );

    }
    catch (error) {

        console.error(
            "WeRemember error:",
            error
        );

    }
}
function removeSuggestionBox() {

    if (suggestionBox) {
        suggestionBox.remove();
        suggestionBox = null;
    }
}


function showSuggestions(input) {

    removeSuggestionBox();


    if (currentCredentials.length === 0)
        return;


    const rect =
        input.getBoundingClientRect();


    suggestionBox =
        document.createElement("div");


    suggestionBox.style.position =
        "absolute";

    suggestionBox.style.left =
        `${window.scrollX + rect.left}px`;

    suggestionBox.style.top =
        `${window.scrollY + rect.bottom + 4}px`;

    suggestionBox.style.width =
        `${Math.max(rect.width, 260)}px`;

    suggestionBox.style.background =
        "linear-gradient(180deg, #effdfa 0%, #ffffff 78%)";

    suggestionBox.style.border =
        "1px solid rgba(16, 42, 53, 0.12)";

    suggestionBox.style.borderRadius =
        "8px";

    suggestionBox.style.boxShadow =
        "0 18px 44px rgba(16, 42, 53, 0.18)";

    suggestionBox.style.zIndex =
        "2147483647";

    suggestionBox.style.fontFamily =
        "Inter, Arial, sans-serif";


    const title =
        document.createElement("div");

    title.textContent =
        "WeRemember";

    title.style.fontWeight =
        "800";

    title.style.padding =
        "12px";

    title.style.borderBottom =
        "1px solid rgba(16, 42, 53, 0.08)";

    title.style.color =
        "#102a35";


    suggestionBox.appendChild(title);


    currentCredentials.forEach(
        credential => {

            const item =
                document.createElement("div");

            item.style.padding =
                "10px";

            item.style.cursor =
                "pointer";

            item.style.borderBottom =
                "1px solid rgba(16, 42, 53, 0.08)";

            item.style.borderRadius =
                "8px";

            item.style.margin =
                "4px 8px";


            const website =
                document.createElement("div");

            website.textContent =
                credential.websiteName;

            website.style.fontWeight =
                "bold";


            const username =
                document.createElement("div");

            username.textContent =
                credential.username;

            username.style.fontSize =
                "13px";

            username.style.color =
                "#555";


            item.appendChild(website);
            item.appendChild(username);


            item.addEventListener(
                "mouseenter",
                () => {
                    item.style.background =
                        "rgba(2, 184, 169, 0.1)";
                }
            );


            item.addEventListener(
                "mouseleave",
                () => {
                    item.style.background =
                        "transparent";
                }
            );


            item.addEventListener(
                "mousedown",
                async (event) => {

                    event.preventDefault();

                    await useCredential(
                        credential
                    );

                    removeSuggestionBox();

                }
            );


            suggestionBox.appendChild(item);
        }
    );


    document.body.appendChild(
        suggestionBox
    );
}


async function useCredential(credential) {

    try {

        const result =
            await chrome.runtime.sendMessage({
                type: "GET_CREDENTIAL",
                id: credential.id
            });


        if (!result || !result.success)
            return;


        const fullCredential =
            result.data;

        fillCredential(
            fullCredential
        );

    }
    catch (error) {

        console.error(
            "WeRemember autofill failed:",
            error
        );

    }
}

function fillCredential(credential) {

    selectedCredential =
        credential;

    const usernameInput =
        findUsernameInput();


    if (usernameInput) {

        setInputValue(
            usernameInput,
            credential.username
        );

    }


    const passwordInput =
        findPasswordInput();


    if (passwordInput) {

        setInputValue(
            passwordInput,
            credential.password
        );

    }
}

function attachToInputs() {

    const inputs =
        document.querySelectorAll(
            'input[type="email"],' +
            'input[type="text"],' +
            'input[type="password"],' +
            'input[autocomplete="username"]'
        );


    inputs.forEach(input => {

        if (
            input.dataset.werememberAttached
        ) {
            return;
        }


        input.dataset.werememberAttached =
            "true";


        input.addEventListener(
            "focus",
            () => {

                showSuggestions(
                    input
                );

            }
        );

    });
}


function tryFillNewPasswordField() {

    if (!selectedCredential)
        return;


    const passwordInput =
        findPasswordInput();


    if (
        passwordInput &&
        !passwordInput.value
    ) {

        setInputValue(
            passwordInput,
            selectedCredential.password
        );

    }
}


const observer =
    new MutationObserver(() => {

        attachToInputs();

        tryFillNewPasswordField();

    });


observer.observe(
    document.documentElement,
    {
        childList: true,
        subtree: true
    }
);


document.addEventListener(
    "click",
    event => {

        if (
            suggestionBox &&
            !suggestionBox.contains(
                event.target
            ) &&
            !event.target.closest(
                'input[data-weremember-attached="true"]'
            )
        ) {

            removeSuggestionBox();

        }

    }
);


chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message.type !== "AUTOFILL")
            return;

        fillCredential({
            username: message.username,
            password: message.password
        });

        sendResponse({
            success: true
        });
    }
);


window.addEventListener(
    "scroll",
    () => {
        removeSuggestionBox();
    }
);


async function initializeWeRemember() {

    await loadCredentials();

    attachToInputs();

}


initializeWeRemember();

// ======================================================
// NEW LOGIN DETECTION
// ======================================================

function getLoginUsername(form) {

    // Best case: proper username autocomplete
    let input =
        form.querySelector(
            'input[autocomplete="username"]'
        );

    if (input && input.value.trim())
        return input;


    // Email login
    input =
        form.querySelector(
            'input[type="email"]'
        );

    if (input && input.value.trim())
        return input;


    // Common username field names
    input =
        form.querySelector(
            'input[name*="user" i]'
        );

    if (input && input.value.trim())
        return input;


    input =
        form.querySelector(
            'input[name*="email" i]'
        );

    if (input && input.value.trim())
        return input;


    // Last fallback
    const textInputs =
        form.querySelectorAll(
            'input[type="text"]'
        );


    for (const textInput of textInputs) {

        if (textInput.value.trim())
            return textInput;

    }


    return null;
}


async function captureLogin(form) {

    const passwordInput =
        form.querySelector(
            'input[type="password"]'
        );


    if (
        !passwordInput ||
        !passwordInput.value
    ) {
        return;
    }


    const usernameInput =
        getLoginUsername(form);


    if (
        !usernameInput ||
        !usernameInput.value.trim()
    ) {
        return;
    }


    const loginData = {

        website:
            normalizeHost(
                window.location.hostname
            ),

        username:
            usernameInput.value.trim(),

        password:
            passwordInput.value,

        loginUrl:
            window.location.href,

        origin:
            window.location.origin,

        capturedAt:
            Date.now()

    };


    try {

        const result =
            await chrome.runtime.sendMessage({

                type:
                    "LOGIN_SUBMITTED",

                data:
                    loginData

            });


        if (!result || !result.success) {

            console.error(
                "WeRemember login capture failed:",
                result?.message ??
                "No response from extension background worker."
            );

        }

    }
    catch (error) {

        console.error(
            "WeRemember login capture failed. Reload this tab if the extension was just reloaded:",
            error
        );

    }

}


// ------------------------------------------------------
// FORM SUBMIT
// ------------------------------------------------------

document.addEventListener(
    "submit",
    function (event) {

        const form =
            event.target;


        if (
            !(form instanceof HTMLFormElement)
        ) {
            return;
        }


        captureLogin(form);

    },

    true
);

// ======================================================
// LOGIN BUTTON FALLBACK
// ======================================================

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                'button, input[type="submit"]'
            );


        if (!button)
            return;


        let form =
            button.closest("form");


        if (!form) {

            const passwordInput =
                document.querySelector(
                    'input[type="password"]'
                );


            if (!passwordInput)
                return;


            form =
                passwordInput.closest(
                    "form"
                );

        }


        if (!form)
            return;


        setTimeout(
            () => {

                captureLogin(form);

            },
            100
        );

    },

    true
);

// ======================================================
// SAVE PASSWORD POPUP
// ======================================================

function showSavePasswordPopup(
    pendingLogin
) {

    // Prevent duplicate popup
    if (
        document.getElementById(
            "weremember-save-popup"
        )
    ) {
        return;
    }


    const popup =
        document.createElement("div");


    popup.id =
        "weremember-save-popup";


    popup.innerHTML = `

        <div class="weremember-save-title">
            <span class="weremember-save-icon">M</span>
            <span>WeRemember</span>
        </div>

        <div class="weremember-save-question">
            Save login for
            <strong>
                ${escapeWeRememberHtml(
        pendingLogin.website
    )}
            </strong>?
        </div>

        <div class="weremember-save-user">
            ${escapeWeRememberHtml(
        pendingLogin.username
    )}
        </div>

        <div class="weremember-save-actions">

            <button
                id="weremember-not-now"
                type="button"
            >
                Not now
            </button>

            <button
                id="weremember-save-login"
                type="button"
            >
                Save
            </button>

        </div>

    `;


    Object.assign(
        popup.style,
        {

            position:
                "fixed",

            top:
                "20px",

            right:
                "20px",

            width:
                "320px",

            background:
                "linear-gradient(180deg, #effdfa 0%, #ffffff 78%)",

            color:
                "#102a35",

            border:
                "1px solid rgba(16, 42, 53, 0.12)",

            borderRadius:
                "8px",

            padding:
                "18px",

            boxShadow:
                "0 18px 44px rgba(16, 42, 53, 0.18)",

            zIndex:
                "2147483647",

            fontFamily:
                "Inter, Arial, sans-serif"

        }
    );


    document.body.appendChild(
        popup
    );


    const title =
        popup.querySelector(
            ".weremember-save-title"
        );


    Object.assign(
        title.style,
        {

            fontSize:
                "17px",

            fontWeight:
                "800",

            marginBottom:
                "12px",

            display:
                "flex",

            alignItems:
                "center",

            gap:
                "10px"

        }
    );


    const question =
        popup.querySelector(
            ".weremember-save-question"
        );


    const icon =
        popup.querySelector(
            ".weremember-save-icon"
        );


    Object.assign(
        icon.style,
        {

            display:
                "grid",

            width:
                "30px",

            height:
                "30px",

            placeItems:
                "center",

            borderRadius:
                "8px",

            color:
                "#ffffff",

            background:
                "linear-gradient(135deg, #02b8a9, #246bfe)",

            fontSize:
                "14px"

        }
    );


    Object.assign(
        question.style,
        {

            fontSize:
                "14px",

            color:
                "#102a35",

            lineHeight:
                "1.45",

            marginBottom:
                "8px"

        }
    );


    const user =
        popup.querySelector(
            ".weremember-save-user"
        );


    Object.assign(
        user.style,
        {

            fontSize:
                "13px",

            color:
                "#637887",

            marginBottom:
                "18px"

        }
    );


    const actions =
        popup.querySelector(
            ".weremember-save-actions"
        );


    Object.assign(
        actions.style,
        {

            display:
                "flex",

            justifyContent:
                "flex-end",

            gap:
                "10px"

        }
    );


    const notNow =
        popup.querySelector(
            "#weremember-not-now"
        );


    const save =
        popup.querySelector(
            "#weremember-save-login"
        );


    Object.assign(
        notNow.style,
        {

            border:
                "none",

            background:
                "transparent",

            color:
                "#637887",

            padding:
                "8px 12px",

            borderRadius:
                "8px",

            cursor:
                "pointer"

        }
    );


    Object.assign(
        save.style,
        {

            border:
                "none",

            borderRadius:
                "8px",

            padding:
                "8px 16px",

            background:
                "#02b8a9",

            color:
                "white",

            cursor:
                "pointer"

        }
    );


    // --------------------------
    // NOT NOW
    // --------------------------

    notNow.addEventListener(
        "click",
        async () => {

            await chrome.runtime.sendMessage({

                type:
                    "DISCARD_PENDING_LOGIN"

            });


            popup.remove();

        }
    );


    // --------------------------
    // SAVE
    // --------------------------

    save.addEventListener(
        "click",
        async () => {

            save.disabled =
                true;


            save.textContent =
                "Saving...";


            try {

                const result =
                    await chrome.runtime.sendMessage({

                        type:
                            "SAVE_PENDING_LOGIN"

                    });


                if (
                    result &&
                    result.success
                ) {

                    save.textContent =
                        "Saved";


                    setTimeout(
                        () => {

                            popup.remove();

                        },
                        700
                    );

                }
                else {

                    save.disabled =
                        false;


                    save.textContent =
                        "Save";


                    alert(
                        result?.message ??
                        "WeRemember could not save this login."
                    );

                }

            }
            catch (error) {

                console.error(
                    error
                );


                save.disabled =
                    false;


                save.textContent =
                    "Save";

            }

        }
    );

}

function escapeWeRememberHtml(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;
}

async function checkForPendingLogin() {

    try {

        // Give the website some time to load
        await new Promise(resolve =>
            setTimeout(
                resolve,
                1500
            )
        );


        const response =
            await chrome.runtime.sendMessage({

                type:
                    "GET_PENDING_LOGIN"

            });


        if (
            !response ||
            !response.success ||
            !response.data
        ) {
            return;
        }


        const pendingLogin =
            response.data;


        const currentHost =
            normalizeHost(
                window.location.hostname
            );


        // Make sure we're still on same website
        if (
            pendingLogin.website !==
            currentHost
        ) {
            return;
        }


        /*
            Basic failure protection:

            If the password input is still clearly visible,
            we're probably still sitting on the login screen.

            Example:
            Wrong password entered.
        */

        const passwordInput =
            document.querySelector(
                'input[type="password"]'
            );


        if (
            passwordInput &&
            passwordInput.offsetParent !== null
        ) {

            console.log(
                "WeRemember: login form still visible, not asking to save yet."
            );

            return;
        }


        showSavePasswordPopup(
            pendingLogin
        );

    }
    catch (error) {

        console.error(
            "Pending login check failed:",
            error
        );

    }

}


checkForPendingLogin();
