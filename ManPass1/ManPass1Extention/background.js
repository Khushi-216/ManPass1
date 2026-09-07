const API_BASE = "https://localhost:7189";

async function getToken() {

    const data =
        await chrome.storage.local.get(
            "werememberToken"
        );

    return data.werememberToken;
}

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {


        if (message.type === "LOGIN") {

            fetch(
                `${API_BASE}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: message.email,
                        password: message.password
                    })
                }
            )

                .then(response => {

                    if (!response.ok)
                        throw new Error(
                            "Invalid email or password"
                        );

                    return response.json();

                })

                .then(async data => {

                    await chrome.storage.local.set({
                        werememberToken: data.token
                    });

                    sendResponse({
                        success: true
                    });

                })

                .catch(error => {

                    sendResponse({
                        success: false,
                        error: error.message
                    });

                });


            return true;
        }



        if (message.type === "GET_CREDENTIALS") {

            getToken().then(token => {

                if (!token) {

                    sendResponse({
                        success: false,
                        error: "NOT_LOGGED_IN"
                    });

                    return;
                }


                fetch(
                    `${API_BASE}/api/vault/credentials`,
                    {
                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                )

                    .then(response => {

                        if (response.status === 401)
                            throw new Error(
                                "NOT_LOGGED_IN"
                            );

                        if (!response.ok)
                            throw new Error(
                                `HTTP ${response.status}`
                            );

                        return response.json();

                    })

                    .then(data => {

                        sendResponse({
                            success: true,
                            data: data
                        });

                    })

                    .catch(error => {

                        sendResponse({
                            success: false,
                            error: error.message
                        });

                    });

            });


            return true;
        }



        if (message.type === "GET_CREDENTIAL") {

            getToken().then(token => {

                if (!token) {

                    sendResponse({
                        success: false,
                        error: "NOT_LOGGED_IN"
                    });

                    return;
                }


                fetch(
                    `${API_BASE}/api/vault/credential/${message.id}`,
                    {
                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                )

                    .then(response => {

                        if (!response.ok)
                            throw new Error(
                                `HTTP ${response.status}`
                            );

                        return response.json();

                    })

                    .then(data => {

                        sendResponse({
                            success: true,
                            data: data
                        });

                    })

                    .catch(error => {

                        sendResponse({
                            success: false,
                            error: error.message
                        });

                    });

            });


            return true;
        }



        if (message.type === "LOGOUT") {

            chrome.storage.local.remove(
                "werememberToken"
            );

            sendResponse({
                success: true
            });

        }

    }
);

// ======================================================
// NEW LOGIN - TEMPORARY STORAGE
// ======================================================

chrome.runtime.onMessage.addListener(
    (
        message,
        sender,
        sendResponse
    ) => {

        if (
            message.type !==
            "LOGIN_SUBMITTED"
        ) {
            return;
        }


        (async () => {

            try {

                const tabId =
                    sender.tab?.id;


                if (!tabId) {

                    sendResponse({
                        success: false,
                        message:
                            "Tab ID missing"
                    });

                    return;
                }


                const key =
                    `pendingLogin_${tabId}`;


                await chrome.storage.session.set({

                    [key]:
                        message.data

                });


                console.log(
                    "WeRemember: pending login stored"
                );


                sendResponse({
                    success: true
                });

            }
            catch (error) {

                console.error(
                    "Pending login storage failed:",
                    error
                );


                sendResponse({

                    success: false,

                    message:
                        error.message

                });

            }

        })();


        return true;

    }
);

// ======================================================
// GET PENDING LOGIN
// ======================================================

chrome.runtime.onMessage.addListener(
    (
        message,
        sender,
        sendResponse
    ) => {

        if (
            message.type !==
            "GET_PENDING_LOGIN"
        ) {
            return;
        }


        (async () => {

            try {

                const tabId =
                    sender.tab?.id;


                if (!tabId) {

                    sendResponse({
                        success: false
                    });

                    return;
                }


                const key =
                    `pendingLogin_${tabId}`;


                const result =
                    await chrome.storage.session.get(
                        key
                    );


                const pending =
                    result[key];


                if (!pending) {

                    sendResponse({
                        success: true,
                        data: null
                    });

                    return;
                }


                // Remove very old pending logins
                const age =
                    Date.now() -
                    pending.capturedAt;


                if (
                    age >
                    2 * 60 * 1000
                ) {

                    await chrome.storage.session.remove(
                        key
                    );


                    sendResponse({
                        success: true,
                        data: null
                    });

                    return;
                }


                const token =
                    await getToken();


                if (token) {

                    const existsResponse =
                        await fetch(
                            `${API_BASE}/api/vault/credential/exists`,
                            {
                                method:
                                    "POST",

                                headers:
                                {
                                    "Content-Type":
                                        "application/json",

                                    "Authorization":
                                        `Bearer ${token}`
                                },

                                body:
                                    JSON.stringify({

                                        website:
                                            pending.website,

                                        username:
                                            pending.username,

                                        password:
                                            pending.password,

                                        loginUrl:
                                            pending.loginUrl

                                    })
                            }
                        );


                    if (existsResponse.ok) {

                        const existsResult =
                            await existsResponse.json();


                        if (existsResult.exists) {

                            await chrome.storage.session.remove(
                                key
                            );


                            sendResponse({
                                success: true,
                                data: null
                            });

                            return;
                        }

                    }

                }


                sendResponse({

                    success: true,

                    data:
                        pending

                });

            }
            catch (error) {

                console.error(
                    error
                );


                sendResponse({
                    success: false
                });

            }

        })();


        return true;

    }
);

// ======================================================
// DISCARD PENDING LOGIN
// ======================================================

chrome.runtime.onMessage.addListener(
    (
        message,
        sender,
        sendResponse
    ) => {

        if (
            message.type !==
            "DISCARD_PENDING_LOGIN"
        ) {
            return;
        }


        (async () => {

            const tabId =
                sender.tab?.id;


            if (!tabId) {

                sendResponse({
                    success: false
                });

                return;
            }


            await chrome.storage.session.remove(
                `pendingLogin_${tabId}`
            );


            sendResponse({
                success: true
            });

        })();


        return true;

    }
);

// ======================================================
// SAVE PENDING LOGIN
// ======================================================

chrome.runtime.onMessage.addListener(
    (
        message,
        sender,
        sendResponse
    ) => {

        if (
            message.type !==
            "SAVE_PENDING_LOGIN"
        ) {
            return;
        }


        (async () => {

            try {

                const tabId =
                    sender.tab?.id;


                if (!tabId) {

                    sendResponse({

                        success:
                            false,

                        message:
                            "Could not determine browser tab."

                    });

                    return;
                }


                const key =
                    `pendingLogin_${tabId}`;


                const result =
                    await chrome.storage.session.get(
                        key
                    );


                const login =
                    result[key];


                if (!login) {

                    sendResponse({

                        success:
                            false,

                        message:
                            "Pending login was not found."

                    });

                    return;
                }


                const token =
                    await getToken();


                if (!token) {

                    sendResponse({

                        success:
                            false,

                        message:
                            "Please login to WeRemember first."

                    });

                    return;
                }


                const response =
                    await fetch(
                        `${API_BASE}/api/vault/credential`,
                        {

                            method:
                                "POST",

                            headers:
                            {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body:
                                JSON.stringify({

                                    website:
                                        login.website,

                                    username:
                                        login.username,

                                    password:
                                        login.password,

                                    loginUrl:
                                        login.loginUrl

                                })

                        }
                    );


                if (!response.ok) {

                    const errorText =
                        await response.text();


                    sendResponse({

                        success:
                            false,

                        message:
                            errorText ||
                            "Server rejected credential."

                    });

                    return;
                }


                // Only remove after successful DB save
                await chrome.storage.session.remove(
                    key
                );


                sendResponse({

                    success:
                        true

                });

            }
            catch (error) {

                console.error(
                    "WeRemember credential save failed:",
                    error
                );


                sendResponse({

                    success:
                        false,

                    message:
                        error.message

                });

            }

        })();


        return true;

    }
);
