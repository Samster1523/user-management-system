document.getElementById("login-form")
    .addEventListener("submit", async (event) => {

        event.preventDefault();

        const username =
            document.getElementById("username").value;

        const password =
            document.getElementById("password").value;

        try {
            const response = await fetch("/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to the existing landing page
                window.location.href = "/index.html";
            } else {
                document.getElementById("login-message")
                    .textContent = data.message;
            }

        } catch (error) {
            console.error(error);

            document.getElementById("login-message")
                .textContent = "Unable to connect to the server.";
        }
    });