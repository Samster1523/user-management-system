document.getElementById("signup-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        firstname: document.getElementById("firstname").value,
        lastname: document.getElementById("lastname").value,
        salary: Number(document.getElementById("salary").value),
        age: Number(document.getElementById("age").value)
    };

    const message = document.getElementById("signup-message");

    try {
        const response = await fetch("/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        const data = await response.json();
        message.textContent = data.message;

        if (response.ok) {
            window.location.href = "/";
        }
    } catch (error) {
        message.textContent = "Could not connect to the server.";
    }
});