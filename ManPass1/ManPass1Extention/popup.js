const API_BASE = "https://localhost:7189";

const statusDiv = document.getElementById("status");
const credentialsDiv = document.getElementById("credentials");
const currentSiteDiv = document.getElementById("currentSite");

async function getCurrentTab() {

    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    return tabs[0];
}


async function loadCredentials() {

    try {

        const tab = await getCurrentTab();

        if (!tab || !tab.url) {
            statusDiv.textContent = "Could not detect current website.";
            return;
        }

        const currentUrl = new URL(tab.url);

        currentSiteDiv.textContent =
            `Current site: ${currentUrl.hostname}`;

        const response = await fetch(
            `${API_BASE}/api/vault/credentials`,
            {
                credentials: "include"
            }
        );

        if (response.status === 401) {
            statusDiv.textContent =
                "Please login to ManPass1 first.";
            return;
        }

        const credentials = await response.json();

        const matchingCredentials =
            credentials.filter(credential => {

                if (!credential.websiteUrl)
                    return false;

                try {

                    const savedUrl =
                        new URL(credential.websiteUrl);

                    const savedHost =
                        savedUrl.hostname
                            .toLowerCase()
                            .replace(/^www\./, "");

                    const currentHost =
                        currentUrl.hostname
                            .toLowerCase()
                            .replace(/^www\./, "");

                    return (
                        savedHost === currentHost ||
                        currentHost.endsWith("." + savedHost) ||
                        savedHost.endsWith("." + currentHost)
                    );

                }
                catch {
                    return false;
                }

            });


        credentialsDiv.innerHTML = "";

        if (matchingCredentials.length === 0) {

            statusDiv.textContent =
                "No saved login found for this website.";

            return;
        }

        statusDiv.textContent = "";


        matchingCredentials.forEach(credential => {

            const div =
                document.createElement("div");

            div.className = "credential";


            const website =
                document.createElement("div");

            website.className = "website";
            website.textContent =
                credential.websiteName;


            const username =
                document.createElement("div");

            username.className = "username";
            username.textContent =
                credential.username;


            const button =
                document.createElement("button");

            button.textContent = "Autofill";

            button.addEventListener(
                "click",
                () => autofillCredential(
                    credential.id
                )
            );


            div.appendChild(website);
            div.appendChild(username);
            div.appendChild(button);

            credentialsDiv.appendChild(div);
        });

    }
    catch (error) {

        console.error(error);

        statusDiv.textContent =
            "Unable to connect to ManPass1.";
    }
}


async function autofillCredential(id) {

    try {

        const response = await fetch(
            `${API_BASE}/api/vault/credential/${id}`,
            {
                credentials: "include"
            }
        );


        if (!response.ok) {

            statusDiv.textContent =
                "Could not retrieve credential.";

            return;
        }


        const credential =
            await response.json();


        const tab =
            await getCurrentTab();


        await chrome.storage.session.set({

            pendingCredential: {
                username:
                    credential.username,

                password:
                    credential.password,

                websiteUrl:
                    credential.websiteUrl
            }

        });


        await chrome.tabs.sendMessage(
            tab.id,
            {
                type: "AUTOFILL",

                username:
                    credential.username,

                password:
                    credential.password
            }
        );


        window.close();

    }
    catch (error) {

        console.error(error);

        statusDiv.textContent =
            "Autofill failed.";
    }
}

loadCredentials();